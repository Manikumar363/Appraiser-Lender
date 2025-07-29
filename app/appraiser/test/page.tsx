import React from 'react'
import {
    CompanyIcon,
    DesignationIcon,
    EmailIcon,
    ProfileIcon,
    ProfileIcon2,
    Tick,
    CheckmarkIcon,
    LocationIcon,
    DollarIcon,
    TargetIcon,
    PersonIcon,
    LockIcon,
    Notification,
    ChatAlertIcon,
    AddIcon,
    SearchIcon,
    ResetIcon,
    DeleteIcon,
    ArrowIcon,
    TimerIcon,
    BuildingIcon,
    MessageIcon,
    MapIcon,
    CalendarIcon,
    RightArrow,
    LoadIcon,
    PDFIcon,
    ImageIcon,
    CardIcon,
    HomeIcon,
    JobsIcon,
    SettingsIcon,
    PrivacyIcon,
} from '@/components/icons'

const icons = [
    { name: 'CompanyIcon', Component: CompanyIcon },
    { name: 'DesignationIcon', Component: DesignationIcon },
    { name: 'EmailIcon', Component: EmailIcon },
    { name: 'ProfileIcon', Component: ProfileIcon },
    { name: 'ProfileIcon2', Component: ProfileIcon2 },
    { name: 'Tick', Component: Tick },
    { name: 'CheckmarkIcon', Component: CheckmarkIcon },
    { name: 'LocationIcon', Component: LocationIcon },
    { name: 'DollarIcon', Component: DollarIcon },
    { name: 'TargetIcon', Component: TargetIcon },
    { name: 'PersonIcon', Component: PersonIcon },
    { name: 'LockIcon', Component: LockIcon },
    { name: 'Notification', Component: Notification },
    { name: 'ChatAlertIcon', Component: ChatAlertIcon },
    { name: 'AddIcon', Component: AddIcon },
    { name: 'SearchIcon', Component: SearchIcon },
    { name: 'ResetIcon', Component: ResetIcon },
    { name: 'DeleteIcon', Component: DeleteIcon },
    { name: 'ArrowIcon', Component: ArrowIcon },
    { name: 'TimerIcon', Component: TimerIcon },
    { name: 'BuildingIcon', Component: BuildingIcon },
    { name: 'MessageIcon', Component: MessageIcon },
    { name: 'MapIcon', Component: MapIcon },
    { name: 'CalendarIcon', Component: CalendarIcon },
    { name: 'RightArrow', Component: RightArrow },
    { name: 'LoadIcon', Component: LoadIcon },
    { name: 'PDFIcon', Component: PDFIcon },
    { name: 'ImageIcon', Component: ImageIcon },
    { name: 'CardIcon', Component: CardIcon },
    { name: 'HomeIcon', Component: HomeIcon },
    { name: 'JobsIcon', Component: JobsIcon },
    { name: 'SettingsIcon', Component: SettingsIcon },
    { name: 'PrivacyIcon', Component: PrivacyIcon },
    { name: 'TimerIcon', Component: TimerIcon },

]

export default function TestIconsPage() {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 ,background:"blue"} }>
            {icons.map(({ name, Component }) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
                    <Component />
                    <span style={{ fontSize: 12, marginTop: 8 }}>{name}</span>
                </div>
            ))}
        </div>
    )
}
