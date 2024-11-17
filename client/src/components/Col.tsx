export default function Col({ children, span }: { children: React.ReactNode, span: number }) {
    return (
        <div className={`col-lg-${span ?? 6}`}>
            {children}
        </div>);
}