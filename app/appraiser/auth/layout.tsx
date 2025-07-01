export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex">
            {/* Shared Side Panel */}
            <div className="w-1/3 hidden md:block">
                <img src="/images/logo.png" alt="Logo" className="object-cover w-full h-full" />
            </div>

            {/* Right: the page content */}
            <div className="w-full md:w-2/3 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
