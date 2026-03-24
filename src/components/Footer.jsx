import React from 'react'

const Footer = ({label}) => {
    const currentYear = 2026

    return (
        <footer className="py-6 text-center">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 sm:text-[10px] mb-12 lg:mb-0">
            © {currentYear} BranReadme - {label}
            </p>
        </footer>
    )
}

export default Footer
