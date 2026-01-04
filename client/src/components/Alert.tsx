import '../Alert.css';
import { useState, useEffect } from 'react';

type AlertType = 'success' | 'error';

export default function Alert({
  message,
  type = 'error',
  onClose,
}: {
  message: string;
  type?: AlertType;
  onClose: () => void;
}) {
  const [animation, setAnimation] = useState('animate-slideDown');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimation('animate-slideUp');
      setTimeout(() => onClose(), 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colorStyles =
    type === 'success'
      ? {
          bg: 'bg-green-100',
          border: 'border-green-400',
          text: 'text-green-800',
          title: 'text-green-700',
          label: 'Success',
        }
      : {
          bg: 'bg-red-100',
          border: 'border-red-400',
          text: 'text-red-800',
          title: 'text-red-700',
          label: 'Error',
        };

  return (
    <div className="flex justify-center items-start w-full fixed top-4 right-0 z-50 px-4">
      <div
        className={`${colorStyles.bg} ${colorStyles.border} ${colorStyles.text} px-6 py-4 rounded-lg shadow-md max-w-lg w-full ${animation}`}
        role="alert"
      >
        <p className={`font-bold ${colorStyles.title} mb-1`}>{colorStyles.label}</p>
        <p className={colorStyles.text}>{message}</p>
      </div>
    </div>
  );
}
