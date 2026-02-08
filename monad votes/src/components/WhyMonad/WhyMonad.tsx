import { Hourglass, Zap } from 'lucide-react';
import './WhyMonad.css';

export function WhyMonad() {
    return (
        <section className="why-monad">
            <div className="container">
                <h2 className="section-heading">
                    <span className="scribble-text">Why Monad?</span>
                </h2>

                <div className="speed-comparison">
                    {/* Legacy Side */}
                    <div className="speed-card legacy-card">
                        <div className="speed-header">
                            <Hourglass className="speed-icon" size={24} strokeWidth={2.5} />
                            <span className="speed-label">Legacy Chains</span>
                        </div>
                        <div className="speed-value">~12s</div>
                        <div className="speed-visualizer legacy-visualizer">
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="visualizer-bar" style={{ animationDelay: `${i * 0.1}s` }}></span>
                            ))}
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="speed-arrow">
                        <span>→</span>
                    </div>

                    {/* Monad Side */}
                    <div className="speed-card monad-card">
                        <div className="speed-header">
                            <Zap className="speed-icon" size={24} strokeWidth={2.5} />
                            <span className="speed-label">Monad</span>
                        </div>
                        <div className="speed-value">&lt;1s</div>
                        <div className="speed-visualizer monad-visualizer">
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="visualizer-bar" style={{ animationDelay: `${i * 0.05}s` }}></span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <p className="speed-tagline">
                    <span className="highlight">10,000+ TPS</span> — Parallel execution for real-time results
                </p>
            </div>
        </section>
    );
}
