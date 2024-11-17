export default function Row({ children }: { children: React.ReactNode }) {
    return (
        <div className="row g-0 justify-content-center">
            {children}
        </div>
    );
}