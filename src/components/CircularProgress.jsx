import React from "react";

const CircularProgress = ({ progress }) => {
    const radius = 60;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2}>
            <circle
                stroke="#ddd"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="#4CAF50"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
            <text
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle"
                fontSize="20"
                fill="#444"
            >
                {Math.round(progress)}%
            </text>
        </svg>
    );
};

export default CircularProgress;
