'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';
import { useFirebase } from '@/firebase/provider';
import { Loader2, ShieldOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    email: z.string().email('Por favor, introduce una dirección de correo electrónico válida.'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isRegisterAvailable, setIsRegisterAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!firestore) {
        setIsRegisterAvailable(true);
        setCheckingStatus(false);
        return;
      }
      setCheckingStatus(true);
      try {
        const configDocRef = doc(firestore, 'globalSettings', 'config');
        const configDoc = await getDoc(configDocRef);
        
        if (configDoc.exists() && configDoc.data().isRegisterAvailable === false) {
          setIsRegisterAvailable(false);
        } else {
          setIsRegisterAvailable(true);
        }
      } catch (error) {
        console.error("Error al verificar el estado del registro:", error);
        toast({
          variant: "destructive",
          title: "Error de configuración",
          description: "No se pudo verificar el estado del registro. Contacta al administrador."
        });
        setIsRegisterAvailable(false); 
      } finally {
        setCheckingStatus(false);
      }
    };
    checkRegistrationStatus();
  }, [firestore, toast]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const auth = getAuth();
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      await updateProfile(userCredential.user, {
        displayName: values.name,
      });

      if (firestore) {
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          name: values.name,
          email: values.email,
        });
      }

      toast({
        title: 'Registro Exitoso',
        description: "Has creado tu cuenta.",
        variant: 'default',
        className: 'bg-accent text-accent-foreground',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Registration Error:', error);
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está en uso. Por favor, intenta iniciar sesión.';
      }
      toast({
        title: 'Error en el Registro',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (checkingStatus) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando estado del registro...</p>
        </div>
      );
    }

    if (isRegisterAvailable === false) {
      return (
        <Alert variant="destructive" className="mt-4">
          <ShieldOff className="h-4 w-4" />
          <AlertTitle>Registro Deshabilitado</AlertTitle>
          <AlertDescription>
            El administrador ha deshabilitado actualmente el registro de nuevos usuarios.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear una cuenta
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Crear una Cuenta
          </CardTitle>
          <CardDescription>
            Introduce tus datos a continuación para empezar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
