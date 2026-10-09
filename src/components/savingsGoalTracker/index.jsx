import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiCheck, FiFlag, FiPlus, FiTarget, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const storageKey = "step-by-step-goals";
const dateAt = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};
const sampleGoals = [
    { id: 1, name: "A week by the sea", category: "Travel", target: 150000, saved: 65000, dueDate: dateAt(120), color: "coral" },
    { id: 2, name: "Rainy day reserve", category: "Safety net", target: 200000, saved: 85000, dueDate: dateAt(300), color: "mint" },
    { id: 3, name: "A lighter laptop", category: "Tech", target: 90000, saved: 35500, dueDate: dateAt(60), color: "blue" },
    { id: 4, name: "Refresh the garden", category: "Home", target: 45000, saved: 45000, dueDate: dateAt(-10), color: "gold" },
];
const colors = ["coral", "mint", "blue", "gold"];
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
const readGoals = () => {
    try { const saved = localStorage.getItem(storageKey); return saved ? JSON.parse(saved) : sampleGoals; } catch { return sampleGoals; }
};

const SavingsGoalTracker = () => {
    const [goals, setGoals] = useState(readGoals);
    const [filter, setFilter] = useState("Active");
    const [draft, setDraft] = useState({ name: "", category: "Travel", target: "", saved: "0", dueDate: dateAt(180) });
    const [contribution, setContribution] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    useEffect(() => localStorage.setItem(storageKey, JSON.stringify(goals)), [goals]);

    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.saved), 0);
    const totalRemaining = goals.reduce((sum, goal) => sum + Math.max(0, Number(goal.target) - Number(goal.saved)), 0);
    const completeCount = goals.filter((goal) => Number(goal.saved) >= Number(goal.target)).length;
    const visible = useMemo(() => goals.filter((goal) => filter === "All" || (filter === "Complete" ? Number(goal.saved) >= Number(goal.target) : Number(goal.saved) < Number(goal.target))), [goals, filter]);
    const updateSaved = (id, amount) => setGoals((current) => current.map((goal) => goal.id === id ? { ...goal, saved: Math.max(0, Number(amount)) } : goal));
    const addGoal = (event) => {
        event.preventDefault();
        if (!draft.name.trim() || Number(draft.target) <= 0) return;
        setGoals((current) => [...current, { ...draft, id: Date.now(), name: draft.name.trim(), target: Number(draft.target), saved: Number(draft.saved) || 0, color: colors[current.length % colors.length] }]);
        setDraft({ name: "", category: "Travel", target: "", saved: "0", dueDate: dateAt(180) });
    };
    const addContribution = (event, goal) => {
        event.preventDefault();
        const amount = Number(contribution.amount);
        if (amount <= 0) return;
        updateSaved(goal.id, Number(goal.saved) + amount);
        setContribution(null);
    };
    const removeGoal = () => {
        setGoals((current) => current.filter((goal) => goal.id !== pendingDelete.id));
        setPendingDelete(null);
    };

    return <section className={styles.savingsGoalTracker} id="workspace">
        <div className={styles.hero}><div><p className={styles.context}>SMALL STEPS, BIG PLANS</p><h1>Save for what<br /><span>moves you.</span></h1><p className={styles.description}>A little progress today makes the big things feel closer.</p></div><div className={styles.heroBadge}><FiTarget aria-hidden="true" /><div><span>GOALS IN MOTION</span><strong>{goals.length - completeCount} active</strong><small>{completeCount} completed</small></div></div></div>
        <div className={styles.summary}>
            <article className={styles.savedCard}><span>Across every goal</span><strong>{money(totalSaved)}</strong><small>saved so far</small><div className={styles.sparkline}><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article><span>Still to save</span><strong>{money(totalRemaining)}</strong><small>for all unfinished goals</small></article>
            <article><span>Finished goals</span><strong>{completeCount}</strong><small>things you made happen</small></article>
        </div>
        <section className={styles.goalSection}>
            <div className={styles.sectionHeading}><div><h2>Your goals</h2><p>Change your saved balance or add a contribution.</p></div><div className={styles.filters} role="group" aria-label="Filter savings goals">{["Active", "Complete", "All"].map((item) => <button type="button" key={item} className={filter === item ? styles.activeFilter : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
            <div className={styles.goalGrid}>{visible.map((goal) => {
                const percent = goal.target ? Math.min(100, Number(goal.saved) / Number(goal.target) * 100) : 0;
                const complete = Number(goal.saved) >= Number(goal.target);
                const remaining = Math.max(0, Number(goal.target) - Number(goal.saved));
                return <article className={styles.goalCard + " " + styles[goal.color]} key={goal.id}>
                    <div className={styles.goalTop}><span className={styles.goalIcon}>{complete ? <FiCheck aria-hidden="true" /> : <FiFlag aria-hidden="true" />}</span><span className={styles.category}>{goal.category}</span><button type="button" className={styles.deleteButton} aria-label={"Delete " + goal.name} onClick={() => setPendingDelete(goal)}><FiTrash2 aria-hidden="true" /></button></div>
                    <h3>{goal.name}</h3><div className={styles.targetLine}><span>Target</span><strong>{money(goal.target)}</strong></div>
                    <div className={styles.progressMeta}><span>{Math.round(percent)}% there</span><span>{complete ? "Goal reached" : money(remaining) + " to go"}</span></div><div className={styles.progressTrack}><i style={{ width: percent + "%" }} /></div>
                    <label className={styles.savedInput}>Saved so far<div><span>₹</span><input type="number" min="0" value={goal.saved} onChange={(event) => updateSaved(goal.id, event.target.value)} aria-label={goal.name + " amount saved"} /></div></label>
                    <div className={styles.dueDate}><FiCalendar aria-hidden="true" /><span>{complete ? "Reached" : "Aim for " + new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(goal.dueDate + "T12:00:00"))}</span></div>
                    {contribution && contribution.id === goal.id ? <form className={styles.contributionForm} onSubmit={(event) => addContribution(event, goal)}><label>Add contribution<input autoFocus type="number" min="1" value={contribution.amount} onChange={(event) => setContribution({ ...contribution, amount: event.target.value })} placeholder="Amount" /></label><button type="submit">Add</button><button type="button" onClick={() => setContribution(null)}>Cancel</button></form> : <button type="button" className={styles.contributeButton} onClick={() => setContribution({ id: goal.id, amount: "" })}>{complete ? "Add more" : "Add money"}<FiPlus aria-hidden="true" /></button>}
                </article>;
            })}{visible.length === 0 && <p className={styles.empty}>No goals in this view. Add one when you are ready.</p>}</div>
        </section>
        <form className={styles.addForm} id="add" onSubmit={addGoal}>
            <div className={styles.formHeading}><span><FiPlus aria-hidden="true" /></span><div><h2>Start something new</h2><p>Name the goal and choose a first milestone.</p></div></div>
            <label>Goal name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="What are you saving for?" /></label>
            <label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option>Travel</option><option>Safety net</option><option>Home</option><option>Tech</option><option>Education</option><option>Other</option></select></label>
            <label>Target amount<div><span>₹</span><input required min="1" type="number" value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })} placeholder="0" /></div></label>
            <label>Already saved<div><span>₹</span><input min="0" type="number" value={draft.saved} onChange={(event) => setDraft({ ...draft, saved: event.target.value })} /></div></label>
            <label>Target date<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
            <button type="submit">Create goal <FiPlus aria-hidden="true" /></button>
        </form>
        {pendingDelete && <ConfirmDialog title="Delete this savings goal?" description={'"' + pendingDelete.name + '" and its saved progress will be removed.'} confirmLabel="Delete goal" onCancel={() => setPendingDelete(null)} onConfirm={removeGoal} />}
    </section>;
};
export default SavingsGoalTracker;
