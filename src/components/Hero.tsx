import { ArrowRight, Users, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/rangsit-her.webp";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Rangsit University Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative pt-20 lg:pt-0">
        <div className="max-w-3xl">

          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Welcome to
            <br />
            <span className="">Rangsit University</span>
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 leading-relaxed font-light">
            Empowering minds, shaping futures. Join a community of excellence where
            innovation meets tradition in world-class education.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/international-programs">
              <Button variant="hero" size="lg" className="group">
                Explore Programs
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="group"
            >
              Virtual Tour
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary/90 rounded-lg mb-2 mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary-foreground mb-1">
                25,000+
              </div>
              <div className="text-sm text-primary-foreground/70">Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary/90 rounded-lg mb-2 mx-auto">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary-foreground mb-1">
                100+
              </div>
              <div className="text-sm text-primary-foreground/70">Programs</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary/90 rounded-lg mb-2 mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary-foreground mb-1">
                50+
              </div>
              <div className="text-sm text-primary-foreground/70">Years</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
