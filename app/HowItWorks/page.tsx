import React from 'react'
import styles from './HowItWorks.module.css';

const steps = [
    {
        title: "1. Select your cleaned and simplified CSV file.",
        description: "To start, you must clean your CSV file to only include a column with the course name, the course assignments and the due date"
    },
    {
        title: "2. Wait for the process to finish",
        description: "Depending on how big the file is it could take a couple of seconds to process your information."
    },
    {
        title: "3. Confirm and or Modify reminders",
        description: "You will see a all your tasks and must make sure that all of them are accounted for."
    },
    {
        title: "4. Set reminder dates",
        description: "You will then be prompted to move forward and select the times when you want to be reminded."
    },
    {
        title: "5. Optional but you can make an account",
        description: "Make an account to delete reminders, update reminder times, or just stop entirely."
    }
];

function HowItWorksPage() {
    return (
        <div className={styles.HowItWorksContainer}>
            {steps.map((step, index) => (
                <section key={index} className={styles.step}>
                    <h2>{step.title}</h2>
                    <p>{step.description}</p>
                </section>
            ))}
        </div>
    )
}

export default HowItWorksPage;