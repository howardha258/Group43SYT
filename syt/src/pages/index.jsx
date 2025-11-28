import Layout from "./Layout.jsx";

import Polls from "./Polls";

import CreatePoll from "./CreatePoll";

import PollDetails from "./PollDetails";

import ProfileSetup from "./ProfileSetup";

import JoinPoll from "./JoinPoll";

import MyPolls from "./MyPolls";

import EditPoll from "./EditPoll";

import UserProfile from "./UserProfile";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Polls: Polls,
    
    CreatePoll: CreatePoll,
    
    PollDetails: PollDetails,
    
    ProfileSetup: ProfileSetup,
    
    JoinPoll: JoinPoll,
    
    MyPolls: MyPolls,
    
    EditPoll: EditPoll,
    
    UserProfile: UserProfile,
    
    Settings: Settings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Polls />} />
                
                
                <Route path="/Polls" element={<Polls />} />
                
                <Route path="/CreatePoll" element={<CreatePoll />} />
                
                <Route path="/PollDetails" element={<PollDetails />} />
                
                <Route path="/ProfileSetup" element={<ProfileSetup />} />
                
                <Route path="/JoinPoll" element={<JoinPoll />} />
                
                <Route path="/MyPolls" element={<MyPolls />} />
                
                <Route path="/EditPoll" element={<EditPoll />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/Settings" element={<Settings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}