import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Project Management <span style={{color: '#5db043'}}>Made Simple</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                A powerful, yet easy-to-use project management tool to help you keep track of your projects and tasks.
              </p>
              <div className="space-x-4">
                <Link to="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 md:py-8 border-t">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-gray-500">
          Designed by Znode Pro
        </div>
      </footer>
    </div>
  );
};

export default Index;