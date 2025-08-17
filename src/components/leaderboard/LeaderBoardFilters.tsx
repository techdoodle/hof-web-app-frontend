export const LeaderBoardFilters = ({ selectedCity, setSelectedCity }: { selectedCity: string, setSelectedCity: (city: string) => void }) => {
    return (
        <div className="flex flex-row gap-2">
            <div className="relative flex items-center rounded-lg gradient-border p-2 bg-background">
                <select
                    className="flex-1 p-2 pl-0 bg-transparent outline-none text-foreground text-lg appearance-none cursor-pointer"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="Gurugram">Gurugram</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Surat">Surat</option>
                    <option value="Pune">Pune</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Indore">Indore</option>
                    <option value="Bhopal">Bhopal</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="Vishakhapatnam">Vishakhapatnam</option>
                </select>
                <svg className="w-5 h-5 text-foreground/60 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    )
}