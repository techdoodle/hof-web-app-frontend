const NameComponent = ({ firstName, lastName }: { firstName: string, lastName: string }) => {
    return (
        <div>
            <h2 className="text-xl text-left font-bold text-white font-orbitron" style={{
                fontSize: '40px',
                marginBottom: '10px',
            }}>
                {firstName}
            </h2>
            <h2 className="text-xl text-left font-bold text-[#AAAAAA] font-orbitron" style={{
                fontSize: '40px',
            }}>
                {lastName}
            </h2>
        </div>
    )
}

export default NameComponent;