import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Button({ children, variant = 'primary', className, ...props }) {
    const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(baseClass, className)}
            {...props}
        >
            {children}
        </motion.button>
    );
}
