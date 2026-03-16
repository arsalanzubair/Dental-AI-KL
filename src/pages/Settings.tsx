import { useState, useEffect } from 'react';
import { useSettings, ClinicSettings } from '../hooks/useSettings';
import { Bell, Zap, Calendar, Save, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
    const { settings, loading } = useSettings();
    const { role } = useAuth();

    const [activeTab, setActiveTab] = useState<'reminders' | 'automation' | 'operations'>('reminders');
    const [localSettings, setLocalSettings] = useState<ClinicSettings | null>(null);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (!settings) return;

        const stored = localStorage.getItem("clinic_settings");

        if (stored) {
            try {
                setLocalSettings(JSON.parse(stored));
            } catch {
                setLocalSettings(settings);
            }
        } else {
            setLocalSettings(settings);
        }
    }, [settings]);

    if (loading || !localSettings)
        return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading clinic settings...</div>;

    const handleSave = (updates: Partial<ClinicSettings>) => {

        if (role !== 'Admin') {
            alert('Access Denied: Administrative privileges required.');
            return;
        }

        setSaveState('saving');

        const newSettings = {
            ...localSettings,
            ...updates
        };

        localStorage.setItem("clinic_settings", JSON.stringify(newSettings));

        setLocalSettings(newSettings);

        setSaveState('saved');

        setTimeout(() => setSaveState('idle'), 2000);
    };

    return (
        <div className="animate-up">

            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Clinic Control Settings</h1>
                    <p className="page-subtitle">Configure AI behavior, automated messaging, and clinic operations.</p>
                </div>

                {role !== 'Admin' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700'
                    }}>
                        <Shield size={16} /> READ-ONLY MODE
                    </div>
                )}
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                    <TabButton active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell size={18} />} label="Reminders" />
                    <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={<Zap size={18} />} label="Automation" />
                    <TabButton active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} icon={<Calendar size={18} />} label="Clinic Operations" />
                </div>

                <div style={{ padding: '32px' }}>
                    {activeTab === 'reminders' &&
                        <RemindersTab settings={localSettings} onSave={handleSave} saveState={saveState} isAdmin={role === 'Admin'} />
                    }

                    {activeTab === 'automation' &&
                        <AutomationTab settings={localSettings} onSave={handleSave} saveState={saveState} isAdmin={role === 'Admin'} />
                    }

                    {activeTab === 'operations' &&
                        <OperationsTab settings={localSettings} onSave={handleSave} saveState={saveState} isAdmin={role === 'Admin'} />
                    }
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '16px 24px',
                border: 'none',
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '700',
                color: active ? 'var(--primary)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                backgroundColor: active ? 'var(--card)' : 'transparent'
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function SaveButton({ onClick, saveState }: { onClick: () => void, saveState: string }) {
    return (
        <button className="btn btn-primary" onClick={onClick} style={{ width: 'fit-content', padding: '12px 32px' }}>
            <Save size={18} />
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'saved' && 'Saved ✓'}
            {saveState === 'idle' && 'Save Configuration'}
        </button>
    );
}

function RemindersTab({ settings, onSave, saveState, isAdmin }: any) {

    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Appointment Reminders</h3>

            <select
                className="search-input"
                value={localSettings.reminder_timing}
                disabled={!isAdmin}
                onChange={(e) =>
                    setLocalSettings({ ...localSettings, reminder_timing: e.target.value })
                }
            >
                <option value="12h">12 hours before</option>
                <option value="24h">24 hours before</option>
                <option value="48h">48 hours before</option>
                <option value="1w">1 week before</option>
            </select>

            <textarea
                className="search-input"
                style={{ height: '120px' }}
                value={localSettings.reminder_template}
                disabled={!isAdmin}
                onChange={(e) =>
                    setLocalSettings({ ...localSettings, reminder_template: e.target.value })
                }
            />

            {isAdmin && <SaveButton onClick={() => onSave(localSettings)} saveState={saveState} />}

        </div>
    );
}

function AutomationTab({ settings, onSave, saveState, isAdmin }: any) {

    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Follow-up Automation</h3>

            <textarea
                className="search-input"
                style={{ height: '120px' }}
                value={localSettings.followup_template}
                disabled={!isAdmin}
                onChange={(e) =>
                    setLocalSettings({ ...localSettings, followup_template: e.target.value })
                }
            />

            {isAdmin && <SaveButton onClick={() => onSave(localSettings)} saveState={saveState} />}

        </div>
    );
}

function OperationsTab({ settings, onSave, saveState, isAdmin }: any) {

    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Business Hours</h3>

            {Object.entries(localSettings.business_hours).map(([day, hours]: any) => (

                <div key={day} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

                    <div style={{ width: '100px', fontWeight: '700', textTransform: 'capitalize' }}>
                        {day}
                    </div>

                    <input
                        type="checkbox"
                        checked={hours.enabled}
                        disabled={!isAdmin}
                        onChange={(e) => {

                            const newHours = {
                                ...localSettings.business_hours,
                                [day]: { ...hours, enabled: e.target.checked }
                            };

                            setLocalSettings({
                                ...localSettings,
                                business_hours: newHours
                            });
                        }}
                    />

                    <input
                        type="time"
                        value={hours.open}
                        disabled={!hours.enabled || !isAdmin}
                        onChange={(e) => {

                            const newHours = {
                                ...localSettings.business_hours,
                                [day]: { ...hours, open: e.target.value }
                            };

                            setLocalSettings({
                                ...localSettings,
                                business_hours: newHours
                            });
                        }}
                    />

                    <input
                        type="time"
                        value={hours.close}
                        disabled={!hours.enabled || !isAdmin}
                        onChange={(e) => {

                            const newHours = {
                                ...localSettings.business_hours,
                                [day]: { ...hours, close: e.target.value }
                            };

                            setLocalSettings({
                                ...localSettings,
                                business_hours: newHours
                            });
                        }}
                    />

                </div>

            ))}

            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>After-Hours Behavior</h3>

            <select
                className="search-input"
                value={localSettings.after_hours_behavior}
                disabled={!isAdmin}
                onChange={(e) =>
                    setLocalSettings({
                        ...localSettings,
                        after_hours_behavior: e.target.value
                    })
                }
            >
                <option value="voicemail">Send to Voicemail</option>
                <option value="callback">Offer Callback Request</option>
                <option value="message">Provide Automated Message</option>
            </select>

            {isAdmin && <SaveButton onClick={() => onSave(localSettings)} saveState={saveState} />}

        </div>
    );
}
