import AboutMe from './_components/AboutMe';
import Banner from './_components/Banner';
import Certifications from './_components/Certifications';
import { ContactSection } from './_components/ContactForm';
import Experiences from './_components/Experiences';
import HorizontalScrollLayout from './_components/HorizontalScrollLayout';
import CurrentlyUsing from './_components/CurrentlyUsing';
import Skills from './_components/Skills';
import ProjectList from './_components/ProjectList';

export default function Home() {
    return (
        <HorizontalScrollLayout>
            <div className="page-">
                <Banner />
            </div>
            <div className="page- md:pl-16 lg:pl-24 xl:pl-32">
                <AboutMe />
            </div>
            <div className="page- md:pl-24 lg:pl-40 xl:pl-52">
                <CurrentlyUsing />
            </div>
            <div className="page- md:pl-24 lg:pl-40 xl:pl-52">
                <ProjectList />
            </div>
            <div className="page- md:pl-40 lg:pl-64 xl:pl-80">
                <Experiences />
            </div>
            <div className="page- md:pl-56 lg:pl-88 xl:pl-[28rem]">
                <Skills />
            </div>
            <div className="page- md:pl-64 lg:pl-88 xl:pl-[24rem]">
                <Certifications />
            </div>
            <div className="page- md:pl-24 lg:pl-40 xl:pl-56">
                <ContactSection />
            </div>
        </HorizontalScrollLayout>
    );
}
