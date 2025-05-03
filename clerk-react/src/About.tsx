import React from "react";
import "./About.css";
import img1 from "./assets/comp1.png";
import img2 from "./assets/comp2.png"
import img3 from "./assets/comp3.png"
import img4 from "./assets/comp4.png"

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="logo">Blog<span>ify</span></div>
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Empowering the world to develop technology <br />
            <span>through collective knowledge.</span>
          </h1>
          <p>
            Our products and tools enable people to ask, share and <br />
            learn at work or at home.
          </p>
        </div>
      </section>

      <section className="partners">
        <p>Supporting the innovative teams at</p>
        <div className="partner-logos">
          <img src={img1} alt="Acer" />
          <img src={img2} alt="AMD" />
          <img src={img3} alt="Cisco" />
          <img src={img4} alt="Intel" />
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <h2>17 years</h2>
          <p>of trusted and high-quality knowledge</p>
        </div>
        <div className="stat">
          <h2>14 seconds</h2>
          <p>average time between new questions</p>
        </div>
        <div className="stat">
          <h2>58 million</h2>
          <p>total questions and answers so far</p>
        </div>
        <div className="stat">
          <h2>51 billion</h2>
          <p>times knowledge has been reused</p>
        </div>
      </section>
    </div>
  );
};

export default About;
