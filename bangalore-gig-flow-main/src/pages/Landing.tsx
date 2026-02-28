import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Shield, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {t("app.name")}
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.nav.howItWorks")}
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.nav.features")}
            </a>
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              {t("common.signIn")}
            </Button>
            <Button className="bg-gradient-hero hover:opacity-90 transition-opacity" onClick={() => navigate("/auth")}>
              {t("common.getStarted")}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            {t("landing.hero.badge")}
          </div>
          <h2 className="text-5xl md:text-7xl font-bold leading-tight">
            {t("landing.hero.title")}{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              {t("landing.hero.titleHighlight")}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-glow"
              onClick={() => navigate("/auth")}
            >
              {t("landing.hero.postTask")} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2"
              onClick={() => navigate("/auth")}
            >
              {t("landing.hero.becomeHelper")}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
            {[
              { value: "500+", labelKey: "landing.stats.tasksCompleted" },
              { value: "200+", labelKey: "landing.stats.activeHelpers" },
              { value: "4.8★", labelKey: "landing.stats.avgRating" },
              { value: "< 2hrs", labelKey: "landing.stats.responseTime" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.howItWorks.title")}</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                titleKey: "landing.howItWorks.step1.title",
                descKey: "landing.howItWorks.step1.desc",
                icon: MapPin,
                color: "text-primary",
              },
              {
                step: "02",
                titleKey: "landing.howItWorks.step2.title",
                descKey: "landing.howItWorks.step2.desc",
                icon: Zap,
                color: "text-secondary",
              },
              {
                step: "03",
                titleKey: "landing.howItWorks.step3.title",
                descKey: "landing.howItWorks.step3.desc",
                icon: CheckCircle2,
                color: "text-success",
              },
            ].map((item, i) => (
              <Card key={i} className="p-8 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-muted/30">{item.step}</span>
                  </div>
                  <h4 className="text-xl font-bold">{t(item.titleKey)}</h4>
                  <p className="text-muted-foreground">{t(item.descKey)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.features.title")}</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                titleKey: "landing.features.verified.title",
                descKey: "landing.features.verified.desc",
              },
              {
                icon: MapPin,
                titleKey: "landing.features.tracking.title",
                descKey: "landing.features.tracking.desc",
              },
              {
                icon: Clock,
                titleKey: "landing.features.fast.title",
                descKey: "landing.features.fast.desc",
              },
              {
                icon: Zap,
                titleKey: "landing.features.secure.title",
                descKey: "landing.features.secure.desc",
              },
              {
                icon: CheckCircle2,
                titleKey: "landing.features.local.title",
                descKey: "landing.features.local.desc",
              },
              {
                icon: Shield,
                titleKey: "landing.features.safe.title",
                descKey: "landing.features.safe.desc",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-md transition-shadow">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h4>
                <p className="text-muted-foreground text-sm">{t(feature.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 text-white">
            <h3 className="text-4xl md:text-5xl font-bold">
              {t("landing.cta.title")}
            </h3>
            <p className="text-xl text-white/90">
              {t("landing.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 shadow-xl"
                onClick={() => navigate("/auth")}
              >
                {t("landing.cta.button")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">{t("app.name")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("landing.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
