export default function Input({ type, label, id, name, required }: {
    type?: React.HTMLInputTypeAttribute | undefined,
    label: string,
    id: string,
    name: string,
    required: boolean
}
) {
    return (
        <div className="form-floating mb-3">
            <input
                type={type}
                id={id}
                className="form-control rounded-3"
                name={name}
                placeholder=""
                required={required}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    );
}