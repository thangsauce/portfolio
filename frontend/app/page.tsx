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
            <div className="page- md:pl-12 lg:pl-20 xl:pl-28">
                <Experiences />
            </div>
            <div className="page- md:pl-24 lg:pl-40 xl:pl-52">
                <ProjectList />
            </div>
            <div className="page- md:pl-32 lg:pl-52 xl:pl-72">
                <ITSkills />
            </div>
            <div className="page- md:pl-14 lg:pl-24 xl:pl-32">
                <Skills />
            </div>
            <div className="page- md:pl-32 lg:pl-52 xl:pl-72">
                <Certifications />
            </div>
            <div className="page- md:pl-12 lg:pl-20 xl:pl-28">
                <ContactSection />
            </div>
        </HorizontalScrollLayout>
    );
}
