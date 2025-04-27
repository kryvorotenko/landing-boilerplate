import { ReactNode } from 'react';

interface PropsType {
    children: ReactNode;
}

export default function Button({ children }: PropsType) {
    return (
        <button className="button">
            {children}
        </button>
    );
}