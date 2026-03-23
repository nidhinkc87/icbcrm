import { forwardRef, SelectHTMLAttributes } from 'react';

export default forwardRef<
    HTMLSelectElement,
    SelectHTMLAttributes<HTMLSelectElement>
>(function SelectInput({ className = '', children, ...props }, ref) {
    return (
        <select
            {...props}
            ref={ref}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ' +
                className
            }
        >
            {children}
        </select>
    );
});
