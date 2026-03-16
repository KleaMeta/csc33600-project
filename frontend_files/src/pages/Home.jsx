import smilingChefs from "../assets/smilingchefs.png";
import smilingChefs2 from "../assets/smilingchefs2.jpg";
import Laptop from "../assets/womanlaptop.jpg";
import { Button, Carousel } from "flowbite-react";
import { Link } from "react-router-dom";
function Home() {
  return (
    <>
      <section className="bg-white py-16">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-dark-400">
              Book a professional chef in minutes
            </h1>
            <p className="max-w-2xl mb-6 font-light lg:mb-8 md:text-lg lg:text-xl dark:text-dark-400">
              Tell us what you need, from ingredients to equipment, and we'll
              connect you with chefs who can bring your vision to life.
            </p>
            <Button
              style={{ backgroundColor: "#F0D813", color: "#000000" }}
              size="lg"
            >
              <Link to="/hire-chef">Hire a Chef</Link>
            </Button>
          </div>

          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex h-full xl:h-96">
            {/* <Carousel slide={true} slideInterval={3000}>
              <img
                src={smilingChefs}
                alt="Smiling Chefs"
                className="rounded-lg"
              />
              <img
                src={smilingChefs2}
                alt="Smiling Chefs2"
                className="rounded-lg"
              />
            </Carousel> */}
            <img
              src={smilingChefs}
              alt="Smiling Chefs"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:flex lg:items-center lg:gap-8">
          <img
            src={Laptop}
            alt="How it Works"
            className="w-full lg:w-1/3 max-w-sm rounded-lg object-cover"
          />

          <div className="mt-6 lg:mt-0 lg:w-7/12">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <p className="text-lg mb-2">1. Tell us your requirements.</p>
            <p className="text-lg mb-2">
              2. Get matched with professional chefs.
            </p>
            <p className="text-lg">
              3. Enjoy your personalized cooking experience.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
