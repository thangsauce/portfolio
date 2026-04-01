import AboutMe from './_components/AboutMe';
import Banner from './_components/Banner';
import Certifications from './_components/Certifications';
import { ContactSection } from './_components/ContactForm';
import Experiences from './_components/Experiences';
import HorizontalScrollLayout from './_components/HorizontalScrollLayout';
import ITSkills from './_components/ITSkills';
import Skills from './_components/Skills';
import ProjectList from './_components/ProjectList';

export default function Home() {
    return (
        <HorizontalScrollLayout>
            <div className="page-">
                <Banner />
            </div>
            <div className="page-">
                <AboutMe />
            </div>
            <div className="page-">
                <Experiences />
            </div>
            <div className="page-">
                <ProjectList />
            </div>
            <div className="page-">
                <Certifications />
            </div>
            <div className="page-">
                <ITSkills />
            </div>
            <div className="page-">
                <Skills />
            </div>
            <div className="page-">
                <ContactSection />
            </div>
        </HorizontalScrollLayout>
    );
}
