import { BookOpen, Library, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import rangsitLogo from "@/assets/rangsit-logo.png";
import Ric from "@/assets/RIC1.png"
import PAL from "@/assets/PAL.png"

const QuickLinks = () => {
  const links = [
    {
      title: "RIC",
      description: "Research and Development Center - Leading innovation and research initiatives",
      icon: Ric,
      href: "https://rsuip.org/",
      color: "primary",
      isImage: true,
    },
    {
      title: "RSU Library",
      description: "Access our extensive collection of books, journals, and digital resources",
      icon: rangsitLogo,
      href: "https://library.rsu.ac.th/",
      color: "secondary",
      isImage: true,
    },
    {
      title: "RSU Intranet",
      description: "Student portal for courses, grades, and university services",
      icon: rangsitLogo,
      href: "https://intranet.rsu.ac.th/",
      color: "accent",
      isImage: true,
    },
    {
      title: "RSU PAL",
      description: "Student portal for ENL courses and grades",
      icon: PAL,
      href: "https://ilc.rsu.ac.th/",
      color: "accent",
      isImage: true,
    },
    {
      title: "RSU LMS",
      description: "Learning Management System for courses and assignments",
      icon: rangsitLogo,
      href: "https://lms.rsu.ac.th/",
      color: "accent",
      isImage: true,
    },
    {
      title: "RSU Academic Calendar",
      description: "Academic calendar for the university",
      icon: rangsitLogo,
      href: "https://rsuip.org/academic-calendar/",
      color: "accent",
      isImage: true,
    },
  ];

  return (
    <section id="quick-links" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Quick Access
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Navigate to our essential services and resources
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.href}
                className="group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="p-6 sm:p-8 h-full border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant cursor-pointer bg-card">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src={link.icon} alt={link.title} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
