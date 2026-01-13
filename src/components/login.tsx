'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';
import { useAuth, useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Loader2 } from 'lucide-react';

export function Login() {
    const { isUserLoading } = useFirebase();
    const auth = useAuth();

    const handleAnonymousLogin = () => {
        initiateAnonymousSignIn(auth);
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <AppLogo className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Welcome to MediTrack Rx</CardTitle>
                    <CardDescription>Sign in to manage your medication schedule.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <Button onClick={handleAnonymousLogin} disabled={isUserLoading} className="w-full">
                            {isUserLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Sign In Anonymously'
                            )}
                        </Button>
                         <p className="text-center text-xs text-muted-foreground">
                            Using anonymous sign-in, your data is temporary and will be lost if you clear your browser data.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
