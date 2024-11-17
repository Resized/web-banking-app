export default function CardFooter({ children }: { children: React.ReactNode }) {
    return (
        <div className="card-footer text-body-secondary">
            {children}
        </div>
    );
}