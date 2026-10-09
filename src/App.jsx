import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import SavingsGoalTracker from "./components/savingsGoalTracker";

const repository = "https://github.com/a2rp/savings-goal-tracker";
const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return <div className={styles["app-shell"]} id="top">
        <SiteHeader title="Step by Step" mark="S" navItems={[["My goals", "#workspace"], ["New goal", "#add"]]} repoUrl={repository} />
        <main className={styles["page-content"]}><SavingsGoalTracker /></main>
        <SiteFooter repoUrl={repository} />
        <BackToTop visible={showBackToTop} />
    </div>;
};
export default App;