
export default function CardHeader({ text }: { text: string }) {
    return (
        <div className="card-header">
            <h2 className="fw-semibold m-2">{text}</h2>
        </div>
    );
}