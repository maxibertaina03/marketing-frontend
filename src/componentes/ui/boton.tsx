import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variantesBoton = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variante: {
        primario: 'bg-marca text-white hover:bg-marca-oscuro',
        secundario: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        contorno: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
        fantasma: 'text-slate-700 hover:bg-slate-100',
        peligro: 'bg-red-600 text-white hover:bg-red-700',
      },
      tamano: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variante: 'primario',
      tamano: 'md',
    },
  },
);

export interface PropsBoton
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variantesBoton> {}

export const Boton = forwardRef<HTMLButtonElement, PropsBoton>(
  ({ className, variante, tamano, ...props }, ref) => (
    <button ref={ref} className={cn(variantesBoton({ variante, tamano }), className)} {...props} />
  ),
);
Boton.displayName = 'Boton';
