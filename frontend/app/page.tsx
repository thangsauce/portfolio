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
            <div className="page- md:pl-10 lg:pl-16 xl:pl-20">
                <Experiences />
            </div>
            <div className="page- md:pl-10 lg:pl-16 xl:pl-20">
                <ProjectList />
            </div>
            <div className="page- md:pl-10 lg:pl-16 xl:pl-20">
                <ITSkills />
            </div>
            <div className="page- md:pl-14 lg:pl-24 xl:pl-32">
                <Skills />
            </div>
            <div className="page- md:pl-10 lg:pl-16 xl:pl-20">
                <Certifications />
            </div>
            <div className="page- md:pl-12 lg:pl-20 xl:pl-28">
                <ContactSection />
            </div>
        </HorizontalScrollLayout>
    );
}
