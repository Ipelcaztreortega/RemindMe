import React from 'react'
import styles from './Footer.module.css';
function Footer() {
    return (
        <div className={styles.FooterContainer}>
            <div>
                <h1>Privacy</h1>
            </div>
            <div>
                <h1>Feedback</h1>
            </div>
        </div>
    )
}

export default Footer
