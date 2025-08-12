import React from 'react'
import {
    ProfileIcon,
    ProfileIcon2,
    ProfileIcon3,
    EmailIcon,
    CompanyIcon,
    DesignationIcon,
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
    TimerIcon2,
    BuildingIcon,
    MessageIcon,
    MapIcon,
    CalendarIcon,
    RightArrow,
    LoadIcon,
    PDFIcon,
    ImageIcon,
    CardIcon,
    Select,
    Reject,
    HomeIcon,
    JobsIcon,
    SettingsIcon,
    PrivacyIcon,
    TermsIcon,
    HelpIcon,
    LogoutIcon,
    LeftArrow,
    UserIcon,
    TargettIcon,
    DollerIcon,
    SecondaryProfileIcon,
    ThirdPrimaryIcon,
    HomeTimerIcon,
    RightArrowIcon,
    DateIcon,
    UploadIcon,
    TransctionIcon,
    ResidentialIcon,
    Msg,
    Map,
    Update,
    Next,
    Call,
    Building
} from '@/components/icons'

const icons = [
    { name: 'ProfileIcon', Component: ProfileIcon },
    { name: 'ProfileIcon2', Component: ProfileIcon2 },
    { name: 'ProfileIcon3', Component: ProfileIcon3 },
    { name: 'EmailIcon', Component: EmailIcon },
    { name: 'CompanyIcon', Component: CompanyIcon },
    { name: 'DesignationIcon', Component: DesignationIcon },
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
    { name: 'TimerIcon2', Component: TimerIcon2 },
    { name: 'BuildingIcon', Component: BuildingIcon },
    { name: 'MessageIcon', Component: MessageIcon },
    { name: 'MapIcon', Component: MapIcon },
    { name: 'CalendarIcon', Component: CalendarIcon },
    { name: 'RightArrow', Component: RightArrow },
    { name: 'LoadIcon', Component: LoadIcon },
    { name: 'PDFIcon', Component: PDFIcon },
    { name: 'ImageIcon', Component: ImageIcon },
    { name: 'CardIcon', Component: CardIcon },
    { name: 'Select', Component: Select },
    { name: 'Reject', Component: Reject },
    { name: 'HomeIcon', Component: HomeIcon },
    { name: 'JobsIcon', Component: JobsIcon },
    { name: 'SettingsIcon', Component: SettingsIcon },
    { name: 'PrivacyIcon', Component: PrivacyIcon },
    { name: 'TermsIcon', Component: TermsIcon },
    { name: 'HelpIcon', Component: HelpIcon },
    { name: 'LogoutIcon', Component: LogoutIcon },
    { name: 'LeftArrow', Component: LeftArrow },
    { name: 'UserIcon', Component: UserIcon },
    { name: 'TargettIcon', Component: TargettIcon },
    { name: 'DollerIcon', Component: DollerIcon },
    { name: 'SecondaryProfileIcon', Component: SecondaryProfileIcon },
    { name: 'ThirdPrimaryIcon', Component: ThirdPrimaryIcon },
    { name: 'HomeTimerIcon', Component: () => <HomeTimerIcon color="#2A020D" /> },
    { name: 'RightArrowIcon', Component: RightArrowIcon },
    { name: 'DateIcon', Component: DateIcon },
    { name: 'UploadIcon', Component: UploadIcon },
    { name: 'TransctionIcon', Component: TransctionIcon },
    { name: 'ResidentialIcon', Component: ResidentialIcon },
    { name: 'Msg', Component: Msg },
    { name: 'Map', Component: Map },
    { name: 'Update', Component: Update },
    { name: 'Next', Component: Next },
    { name: 'Call', Component: Call },
    { name: 'Building', Component: Building }
]

export default function TestIconsPage() {
    return (
        <div className='bg-blue-300 p-4 min-h-screen'>
            <h1>All Icons ({icons.length} total)</h1>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '16px' 
            }}>
                {icons.map(({ name, Component }) => (
                    <div key={name} style={{ 
                        border: '1px solid #ddd', 
                        padding: '10px', 
                        textAlign: 'center' 
                    }}>
                        <Component />
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>
                            {name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
