import React from 'react';
import styles from './HowItWorks.module.css';

const steps = [
    {
        title: "Select your cleaned and simplified CSV file.",
        description: "To start, you must clean your CSV file to only include a three columns named: Category, Date, and Task."
    },
    {
        title: "Wait for the process to finish",
        description: "Depending on how big the file is it could take a couple of seconds to process your information."
    },
    {
        title: "Confirm and or Modify reminders",
        description: "You will see all your tasks and must make sure that all of them are accounted for."
    },
    {
        title: "Set reminder dates",
        description: "You will then be prompted to move forward and select the times when you want to be reminded."
    },
    {
        title: "Optional but you can make an account",
        description: "Make an account to delete reminders, update reminder times, or just stop entirely."
    }
];

function HowItWorksPage() {
    return (
        <div className={styles.HowItWorksContainer}>
            <h1>How It Works</h1>
            {steps.map((step, index) => (
                <section key={index} className={styles.step}>
                    <h2>
                        <span className={styles.stepNumber}>{index + 1}</span>
                        {step.title}
                    </h2>
                    <p>{step.description}</p>
                </section>
            ))}
        </div>
    );
}

export default HowItWorksPage;