import { useTheme } from "./ThemeProvider";
import Button from "./ui/Button";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const handleToggle = () => {
        // Check system preference if current theme is 'system'
        const isSystemDark = typeof window !== "undefined"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : false;

        const currentEffectiveTheme = theme === "system"
            ? (isSystemDark ? "dark" : "light")
            : theme;

        // Toggle to the opposite
        if (currentEffectiveTheme === "dark") setTheme("light");
        else setTheme("dark");
    };

    const getIcon = () => {
        const isSystemDark = typeof window !== "undefined"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : false;

        const effectiveTheme = theme === "system"
            ? (isSystemDark ? "dark" : "light")
            : theme;

        if (effectiveTheme === "dark") {
            // Moon icon
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            );
        }

        // Sun icon
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        );
    };

    const labels = {
        light: "Light",
        dark: "Dark",
        system: "Light" // Fallback if still cached
    };

    return (
        <Button
            variant="pill"
            size="sm"
            onClick={handleToggle}
            ariaLabel={`Switch theme, currently ${labels[theme]}`}
            icon={getIcon()}
        >
            <span className="sr-only">{labels[theme]}</span>
        </Button>
    );
}
