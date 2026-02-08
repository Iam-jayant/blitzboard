import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Check, Vote, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getEventById, type Event } from '../lib/eventService';
import {
    getVoterEventState,
    getEventSubmissionsForVoting,
    submitVotes,
    calculateVoteCost,
    type VoterEventState,
    type SubmissionWithVotes,
    type VoteAllocation,
} from '../lib/votingService';
import './VotingPage.css';

type PageState = 'loading' | 'voting' | 'submitting' | 'success' | 'already_voted' | 'error';

export function VotingPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pageState, setPageState] = useState<PageState>('loading');
    const [event, setEvent] = useState<Event | null>(null);
    const [voterState, setVoterState] = useState<VoterEventState | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionWithVotes[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Vote allocations: submission_id -> vote_count
    const [allocations, setAllocations] = useState<Record<string, number>>({});

    // Load event and voter state
    useEffect(() => {
        async function loadData() {
            if (!eventId || !user) return;

            try {
                // Load event
                const eventData = await getEventById(eventId);
                if (!eventData) {
                    setError('Event not found');
                    setPageState('error');
                    return;
                }
                setEvent(eventData);

                // Load voter state
                const state = await getVoterEventState(eventId, user.id);
                if (!state) {
                    setError('You have not joined this event');
                    setPageState('error');
                    return;
                }
                setVoterState(state);

                // Check if already voted
                if (state.has_voted) {
                    setPageState('already_voted');
                    return;
                }

                // Load submissions
                const subs = await getEventSubmissionsForVoting(eventId, user.id);
                setSubmissions(subs);
                setPageState('voting');
            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Failed to load voting page');
                setPageState('error');
            }
        }

        loadData();
    }, [eventId, user]);

    // Calculate credits used in real-time
    const creditsUsed = useMemo(() => {
        return Object.values(allocations).reduce((sum, votes) => sum + calculateVoteCost(votes), 0);
    }, [allocations]);

    const totalCredits = voterState?.total_credits || 100;
    const remainingCredits = totalCredits - creditsUsed;

    const handleVoteChange = (submissionId: string, votes: number) => {
        // Calculate what the new total would be
        const currentCostForThis = calculateVoteCost(allocations[submissionId] || 0);
        const newCostForThis = calculateVoteCost(votes);
        const newTotalUsed = creditsUsed - currentCostForThis + newCostForThis;

        // Only allow if within budget
        if (newTotalUsed <= totalCredits) {
            setAllocations(prev => ({
                ...prev,
                [submissionId]: votes,
            }));
        }
    };

    const handleSubmitVotes = async () => {
        if (!eventId || !user) return;

        setPageState('submitting');
        setError(null);

        const voteAllocations: VoteAllocation[] = Object.entries(allocations)
            .filter(([_, votes]) => votes > 0)
            .map(([submission_id, vote_count]) => ({ submission_id, vote_count }));

        if (voteAllocations.length === 0) {
            setError('Please allocate at least one vote');
            setPageState('voting');
            return;
        }

        const result = await submitVotes(eventId, user.id, voteAllocations);

        if (!result.success) {
            setError(result.error || 'Failed to submit votes');
            setPageState('voting');
            return;
        }

        setPageState('success');
    };

    const getMaxVotesForSubmission = (submissionId: string) => {
        const currentVotes = allocations[submissionId] || 0;
        const creditsSansThis = creditsUsed - calculateVoteCost(currentVotes);
        const availableForThis = totalCredits - creditsSansThis;
        return Math.floor(Math.sqrt(availableForThis));
    };

    const renderContent = () => {
        switch (pageState) {
            case 'loading':
                return (
                    <div className="voting-loading">
                        <Loader2 size={40} className="spinning" />
                        <p>Loading voting page...</p>
                    </div>
                );

            case 'already_voted':
                return (
                    <div className="voting-already">
                        <Check size={48} />
                        <h2>You've Already Voted</h2>
                        <p>Your votes have been recorded for this event.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/dashboard/voter')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                );

            case 'voting':
                return (
                    <>
                        {/* Credit Tracker */}
                        <div className="credit-tracker">
                            <div className="credit-bar">
                                <div
                                    className="credit-fill"
                                    style={{ width: `${(creditsUsed / totalCredits) * 100}%` }}
                                />
                            </div>
                            <div className="credit-info">
                                <span className="credits-used">
                                    <Zap size={16} />
                                    {creditsUsed} used
                                </span>
                                <span className="credits-remaining">
                                    {remainingCredits} remaining
                                </span>
                            </div>
                        </div>

                        {/* Submissions List */}
                        {submissions.length === 0 ? (
                            <div className="no-submissions">
                                <p>No submissions available to vote on.</p>
                            </div>
                        ) : (
                            <div className="submissions-voting-list">
                                {submissions.map(submission => {
                                    const votes = allocations[submission.id] || 0;
                                    const cost = calculateVoteCost(votes);
                                    const maxVotes = getMaxVotesForSubmission(submission.id);

                                    return (
                                        <div key={submission.id} className="voting-submission">
                                            <div className="submission-info">
                                                <h3>{submission.project_title}</h3>
                                                {submission.description && (
                                                    <p>{submission.description}</p>
                                                )}
                                            </div>
                                            <div className="vote-controls">
                                                <button
                                                    className="vote-btn"
                                                    onClick={() => handleVoteChange(submission.id, Math.max(0, votes - 1))}
                                                    disabled={votes === 0}
                                                >
                                                    −
                                                </button>
                                                <div className="vote-display">
                                                    <span className="vote-count">{votes}</span>
                                                    <span className="vote-cost">({cost} credits)</span>
                                                </div>
                                                <button
                                                    className="vote-btn"
                                                    onClick={() => handleVoteChange(submission.id, votes + 1)}
                                                    disabled={votes >= maxVotes}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="voting-actions">
                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleSubmitVotes}
                                disabled={creditsUsed === 0}
                            >
                                <Vote size={20} />
                                Submit Votes
                            </button>
                            <p className="voting-note">
                                Votes are final and cannot be changed after submission.
                            </p>
                        </div>
                    </>
                );

            case 'submitting':
                return (
                    <div className="voting-loading">
                        <Loader2 size={40} className="spinning" />
                        <p>Submitting your votes...</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="voting-success">
                        <div className="success-icon">
                            <Check size={40} />
                        </div>
                        <h2>Votes Submitted! 🎉</h2>
                        <p>Your votes have been recorded.</p>
                        <div className="votes-summary">
                            <span>Credits used: {creditsUsed}</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/leaderboard/${eventId}`)}
                        >
                            View Leaderboard
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/dashboard/voter')}
                            style={{ marginTop: '8px' }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="voting-error">
                        <AlertCircle size={48} />
                        <h2>Something went wrong</h2>
                        <p>{error}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/dashboard/voter')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="voting-page">
            <div className="container">
                {pageState !== 'success' && (
                    <button className="back-btn" onClick={() => navigate('/dashboard/voter')}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                )}

                {event && (
                    <div className="voting-header">
                        <h1>{event.name}</h1>
                        <p>Allocate your votes using Quadratic Voting</p>
                    </div>
                )}

                <div className="voting-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
