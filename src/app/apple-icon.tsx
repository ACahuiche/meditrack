import { ImageResponse } from 'next/og';
import { AppLogo } from '@/components/icons';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '32px', // Apple-specific corner radius
          background: '#f0f9ff', // Background color (hsl(210 100% 97%))
          color: '#3b82f6', // Primary color (hsl(208 92% 60%))
        }}
      >
        <AppLogo style={{ width: '80%', height: '80%' }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
