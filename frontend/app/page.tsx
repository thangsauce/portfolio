import AboutMe from './_components/AboutMe';
import Banner from './_components/Banner';
import Certifications from './_components/Certifications';
import { ContactSection } from './_components/ContactForm';
import Experiences from './_components/Experiences';
import ITSkills from './_components/ITSkills';
import Skills from './_components/Skills';
import ProjectList from './_components/ProjectList';

export default function Home() {
    return (
        <div className="page-">
            <Banner />
            <AboutMe />
            <ITSkills />
            <Certifications />
            <Experiences />
            <ProjectList />
            <Skills />
            <ContactSection />
        </div>
    );
}
