// PDF report generation
async function generateMatchReport(matchData) {
    // Using jsPDF library
    const doc = new jsPDF();
    doc.text('Match Report', 20, 20);
    doc.text(`${matchData.homeTeam} vs ${matchData.awayTeam}`, 20, 30);
    doc.text(`Score: ${matchData.score}`, 20, 40);
    return doc.save('match-report.pdf');
}
