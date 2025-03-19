// utils/pdfExport.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper function to generate QR code (placeholder)
const generateQRCode = async (text) => {
  // This is a placeholder for QR code generation
  // In a real implementation, you would use a library like qrcode-generator
  // For now, we'll return a placeholder image
  return "/images/placeholder-qrcode.png";
};

// Function to generate PDF for a single chart
export const generatePDF = async (chartRef, title, data) => {
  if (!chartRef.current) return;

  // Create PDF in landscape orientation for better chart display
  const pdf = new jsPDF("landscape");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Define colors and styling
  const primaryColor = "#1a73e8";
  const secondaryColor = "#4285f4";
  const textColor = "#202124";

  // Set document properties
  pdf.setProperties({
    title: `IFIT-MOTION-DETECTION: ${title}`,
    subject: "Data Analysis Report",
    author: "IFIT-MOTION-DETECTION Team",
    creator: "IFIT-MOTION-DETECTION System",
  });

  // Add header with logos and title
  const systemLogo = "/images/1.png";
  const schoolLogo = "/images/tup.jpg";

  // Add school logo
  pdf.addImage(schoolLogo, "PNG", 15, 10, 25, 25);

  // Add header line
  pdf.setDrawColor(primaryColor);
  pdf.setLineWidth(0.5);
  pdf.line(15, 40, pageWidth - 15, 40);

  // Add system name with styling
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor);
  pdf.setFontSize(22);
  pdf.text("IFIT-MOTION-DETECTION", pageWidth / 2, 25, { align: "center" });

  // Add report title
  pdf.setTextColor(secondaryColor);
  pdf.setFontSize(16);
  pdf.text(`${title} Report`, pageWidth / 2, 35, { align: "center" });

  // Add system logo
  pdf.addImage(systemLogo, "PNG", pageWidth - 40, 10, 25, 25);

  // Add date on right side
  pdf.setTextColor(textColor);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    pageWidth - 15,
    45,
    { align: "right" }
  );

  // Generate enhanced intelligent analysis based on the data
  let analysis = {};
  let trends = "";
  let recommendations = "";

  if (title === "Active vs Inactive Users") {
    const activeUsers = data.activeUsers;
    const inactiveUsers = data.inactiveUsers;
    const totalUsers = activeUsers + inactiveUsers;
    const activePercentage = ((activeUsers / totalUsers) * 100).toFixed(2);
    const inactivePercentage = ((inactiveUsers / totalUsers) * 100).toFixed(2);

    analysis = {
      title: "USAGE STATISTICS",
      keyMetrics: [
        `Total Users: ${totalUsers}`,
        `Active Users: ${activeUsers} (${activePercentage}%)`,
        `Inactive Users: ${inactiveUsers} (${inactivePercentage}%)`,
      ],
    };

    trends = `The system shows a ${activePercentage}% user engagement rate. This indicates ${
      activePercentage > 70
        ? "strong user adoption"
        : activePercentage > 50
        ? "moderate user adoption"
        : "challenges with user retention"
    }.`;

    recommendations = [
      `${inactivePercentage > 30 ? "Implement" : "Continue"} re-engagement campaigns targeting inactive users`,
      "Analyze usage patterns to identify drop-off points in user experience",
      `Consider ${
        activePercentage < 60 ? "introducing user incentives" : "highlighting success stories"
      } to boost engagement`,
    ];
  } else if (title === "Users by Gender") {
    const maleUsers = data.maleUsers;
    const femaleUsers = data.femaleUsers;
    const totalUsers = maleUsers + femaleUsers;
    const malePercentage = ((maleUsers / totalUsers) * 100).toFixed(2);
    const femalePercentage = ((femaleUsers / totalUsers) * 100).toFixed(2);
    const genderGap = Math.abs(malePercentage - femalePercentage);

    analysis = {
      title: "GENDER DISTRIBUTION",
      keyMetrics: [
        `Total Users: ${totalUsers}`,
        `Male Users: ${maleUsers} (${malePercentage}%)`,
        `Female Users: ${femaleUsers} (${femalePercentage}%)`,
      ],
    };

    trends = `Gender distribution shows a ${
      genderGap < 10 ? "balanced" : "notable"
    } gap of ${genderGap}% between male and female users. ${
      femalePercentage > malePercentage
        ? "Female users dominate the platform."
        : "Male users form the majority of our user base."
    }`;

    recommendations = [
      `${
        genderGap > 20
          ? "Implement targeted marketing to attract more " +
            (malePercentage > femalePercentage ? "female" : "male") +
            " users"
          : "Maintain inclusive content that appeals to all genders"
      }`,
      "Analyze feature usage patterns by gender to identify preferences",
      "Consider user experience adjustments based on gender-specific feedback",
    ];
  } else if (title === "Users by BMI Category") {
    const underweight = data.underweight;
    const normal = data.normal;
    const overweight = data.overweight;
    const obese = data.obese;
    const totalUsers = underweight + normal + overweight + obese;

    const underweightPct = ((underweight / totalUsers) * 100).toFixed(2);
    const normalPct = ((normal / totalUsers) * 100).toFixed(2);
    const overweightPct = ((overweight / totalUsers) * 100).toFixed(2);
    const obesePct = ((obese / totalUsers) * 100).toFixed(2);

    analysis = {
      title: "BMI CATEGORY DISTRIBUTION",
      keyMetrics: [
        `Total Users Analyzed: ${totalUsers}`,
        `Underweight: ${underweight} (${underweightPct}%)`,
        `Normal: ${normal} (${normalPct}%)`,
        `Overweight: ${overweight} (${overweightPct}%)`,
        `Obese: ${obese} (${obesePct}%)`,
      ],
    };

    const concernGroup = Math.max(
      parseFloat(underweightPct),
      parseFloat(overweightPct),
      parseFloat(obesePct)
    );
    const concernCategory =
      concernGroup === parseFloat(underweightPct)
        ? "underweight"
        : concernGroup === parseFloat(overweightPct)
        ? "overweight"
        : "obese";

    trends = `${normalPct}% of users fall within the normal BMI range. The ${concernCategory} category represents a significant ${concernGroup}% of users, indicating a potential focus area for health interventions.`;

    recommendations = [
      `Develop specialized workout regimens for ${concernCategory} users`,
      `Create educational content about nutrition for users in ${
        parseFloat(underweightPct) > 15
          ? "underweight"
          : parseFloat(obesePct) > 15
          ? "obese"
          : "all"
      } categories`,
      "Implement progress tracking features with achievable milestones",
      "Consider partnering with nutrition experts for personalized guidance",
    ];
  } else if (title === "BMI Distribution") {
    const averageBMI = (
      data.reduce((sum, user) => sum + user.bmi, 0) / data.length
    ).toFixed(2);
    const minBMI = Math.min(...data.map((user) => user.bmi)).toFixed(2);
    const maxBMI = Math.max(...data.map((user) => user.bmi)).toFixed(2);
    const medianBMI = data
      .map((user) => user.bmi)
      .sort((a, b) => a - b)[Math.floor(data.length / 2)]
      .toFixed(2);

    // Calculate standard deviation
    const mean = parseFloat(averageBMI);
    const variance =
      data.reduce((sum, user) => sum + Math.pow(user.bmi - mean, 2), 0) /
      data.length;
    const stdDev = Math.sqrt(variance).toFixed(2);

    analysis = {
      title: "BMI STATISTICAL ANALYSIS",
      keyMetrics: [
        `Total Sample Size: ${data.length}`,
        `Average BMI: ${averageBMI}`,
        `Median BMI: ${medianBMI}`,
        `Range: ${minBMI} - ${maxBMI}`,
        `Standard Deviation: ${stdDev}`,
      ],
    };

    trends = `The average BMI of ${averageBMI} falls within the ${
      averageBMI < 18.5
        ? "underweight"
        : averageBMI < 25
        ? "normal"
        : averageBMI < 30
        ? "overweight"
        : "obese"
    } category. The distribution shows a standard deviation of ${stdDev}, indicating ${
      parseFloat(stdDev) < 3 ? "relatively consistent" : "widely varying"
    } BMI values among users.`;

    recommendations = [
      "Implement personalized fitness programs based on BMI categories",
      `Focus on healthy weight maintenance for users in the ${
        parseFloat(averageBMI) < 18.5
          ? "underweight"
          : parseFloat(averageBMI) < 25
          ? "normal"
          : parseFloat(averageBMI) < 30
          ? "overweight"
          : "obese"
      } range`,
      "Track BMI changes over time to measure program effectiveness",
      "Consider adding body composition analysis for more comprehensive assessment",
    ];
  } else if (title === "Leaderboard - Average Accuracy") {
    const topUser = data[0]; // Assuming data is sorted by average accuracy
    const bottomUser = data[data.length - 1];
    const averageAccuracy = (
      data.reduce((sum, user) => sum + user.average_accuracy, 0) / data.length
    ).toFixed(2);
    const medianAccuracy = data
      .map((user) => user.average_accuracy)
      .sort((a, b) => a - b)[Math.floor(data.length / 2)]
      .toFixed(2);

    analysis = {
      title: "PERFORMANCE METRICS",
      keyMetrics: [
        `Total Users Analyzed: ${data.length}`,
        `Top Performer: ${topUser.name} (${topUser.average_accuracy}%)`,
        `Average Accuracy: ${averageAccuracy}%`,
        `Median Accuracy: ${medianAccuracy}%`,
        `Lowest Accuracy: ${bottomUser.name} (${bottomUser.average_accuracy}%)`,
      ],
    };

    const performanceGap = (topUser.average_accuracy - bottomUser.average_accuracy).toFixed(2);

    trends = `There is a ${performanceGap}% accuracy gap between top and bottom performers. The average accuracy of ${averageAccuracy}% indicates ${
      parseFloat(averageAccuracy) > 80
        ? "excellent"
        : parseFloat(averageAccuracy) > 70
        ? "good"
        : parseFloat(averageAccuracy) > 60
        ? "moderate"
        : "concerning"
    } overall system efficacy.`;

    recommendations = [
      `${parseFloat(averageAccuracy) < 75 ? "Implement" : "Continue"} targeted training for users below ${medianAccuracy}% accuracy`,
      "Create achievement recognition system to motivate improvement",
      "Analyze motion patterns of top performers for training materials",
      `Consider ${
        parseFloat(performanceGap) > 30 ? "revising tutorial materials" : "advanced training modules"
      } to address performance gaps`,
    ];
  } else if (title === "Total Dances (Line Chart)") {
    // Analysis for Total Dances
    const totalDances = data.reduce((sum, user) => sum + user.total_dances, 0);
    const averageDances = (totalDances / data.length).toFixed(2);
    const maxDances = Math.max(...data.map((user) => user.total_dances));
    const minDances = Math.min(...data.map((user) => user.total_dances));

    analysis = {
      title: "TOTAL DANCES ANALYSIS",
      keyMetrics: [
        `Total Dances: ${totalDances}`,
        `Average Dances per User: ${averageDances}`,
        `Maximum Dances: ${maxDances}`,
        `Minimum Dances: ${minDances}`,
      ],
    };

    trends = `The total number of dances performed by all users is ${totalDances}, with an average of ${averageDances} dances per user. The highest number of dances by a single user is ${maxDances}, while the lowest is ${minDances}.`;

    recommendations = [
      "Encourage users with lower dance counts to participate more frequently.",
      "Recognize top performers to motivate others.",
      "Analyze patterns in dance activity to identify peak engagement times.",
    ];
  } else if (title === "Calories Burned (Doughnut Chart)") {
    // Analysis for Calories Burned
    const totalCalories = data.reduce(
      (sum, user) => sum + (user.average_accuracy / 100) * (user.total_dances * 10),
      0
    );
    const averageCalories = (totalCalories / data.length).toFixed(2);
    const maxCalories = Math.max(
      ...data.map((user) => (user.average_accuracy / 100) * (user.total_dances * 10))
    );
    const minCalories = Math.min(
      ...data.map((user) => (user.average_accuracy / 100) * (user.total_dances * 10))
    );

    analysis = {
      title: "CALORIES BURNED ANALYSIS",
      keyMetrics: [
        `Total Calories Burned: ${totalCalories.toFixed(2)}`,
        `Average Calories Burned per User: ${averageCalories}`,
        `Maximum Calories Burned: ${maxCalories.toFixed(2)}`,
        `Minimum Calories Burned: ${minCalories.toFixed(2)}`,
      ],
    };

    trends = `The total calories burned by all users is ${totalCalories.toFixed(2)}, with an average of ${averageCalories} calories per user. The highest calories burned by a single user is ${maxCalories.toFixed(2)}, while the lowest is ${minCalories.toFixed(2)}.`;

    recommendations = [
      "Encourage users to maintain consistent activity levels to burn more calories.",
      "Provide personalized calorie goals based on user profiles.",
      "Highlight the health benefits of regular activity to motivate users.",
    ];
  }

  // Add analysis section with styled formatting
  const chartStartY = 65; // Starting Y position for chart

  // Title for analysis section
  pdf.setFillColor(primaryColor);
  pdf.rect(pageWidth / 2 + 5, 50, pageWidth / 2 - 20, 10, "F");
  pdf.setTextColor("#FFFFFF");
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(analysis.title, pageWidth / 2 + 10, 57);

  // Key metrics
  pdf.setTextColor(textColor);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Key Metrics:", pageWidth / 2 + 5, 70);
  pdf.setFont("helvetica", "normal");

  analysis.keyMetrics.forEach((metric, index) => {
    pdf.text(`• ${metric}`, pageWidth / 2 + 10, 75 + index * 5);
  });

  // Trends section
  const trendsY = 75 + analysis.keyMetrics.length * 5 + 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("Trends:", pageWidth / 2 + 5, trendsY);
  pdf.setFont("helvetica", "normal");

  const splitTrends = pdf.splitTextToSize(trends, pageWidth / 2 - 25);
  pdf.text(splitTrends, pageWidth / 2 + 10, trendsY + 5);

  // Recommendations section
  const recsY = trendsY + splitTrends.length * 5 + 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("Recommendations:", pageWidth / 2 + 5, recsY);
  pdf.setFont("helvetica", "normal");

  if (Array.isArray(recommendations)) {
    recommendations.forEach((rec, index) => {
      pdf.text(`${index + 1}. ${rec}`, pageWidth / 2 + 10, recsY + 5 + index * 5);
    });
  } else {
    const splitRecs = pdf.splitTextToSize(recommendations, pageWidth / 2 - 25);
    pdf.text(splitRecs, pageWidth / 2 + 10, recsY + 5);
  }

  // Add chart image
  const canvas = await html2canvas(chartRef.current);
  const imgData = canvas.toDataURL("image/png");

  // Calculate chart dimensions to fit nicely on left side
  const imgWidth = pageWidth / 2 - 25;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add chart with border
  pdf.setDrawColor(primaryColor);
  pdf.setLineWidth(0.5);
  pdf.rect(15, chartStartY - 5, imgWidth + 10, imgHeight + 10);
  pdf.addImage(imgData, "PNG", 20, chartStartY, imgWidth, imgHeight);

  // Add chart title
  pdf.setFillColor(primaryColor);
  pdf.rect(15, chartStartY - 15, imgWidth + 10, 10, "F");
  pdf.setTextColor("#FFFFFF");
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("VISUAL REPRESENTATION", 20, chartStartY - 7);

  // Add footer with page numbers
  const totalPages = 1; // Assuming one page for now
  pdf.setDrawColor(primaryColor);
  pdf.setLineWidth(0.5);
  pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  pdf.setTextColor(textColor);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    "This report is automatically generated by the IFIT-MOTION-DETECTION system",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  pdf.setFont("helvetica", "normal");
  pdf.text(`Page 1 of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: "right" });

  // Add watermark/copyright
  pdf.setTextColor(220, 220, 220); // Light gray
  pdf.setFontSize(30);
  pdf.setFont("helvetica", "bold");

  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  pdf.saveGraphicsState();
  pdf.text("IFIT-MOTION-DETECTION", centerX, centerY, {
    align: "center",
    angle: 45,
  });
  pdf.restoreGraphicsState();

  // Save PDF with formatted filename
  const cleanTitle = title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  pdf.save(`ifit-${cleanTitle}-report-${timestamp}.pdf`);

  // Return the document for further processing if needed
  return pdf;
};

// Function to generate overall PDF report
// Function to generate overall PDF report
export const generateOverallPDF = async (data) => {
  // Initialize PDF document with better quality settings
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Get page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Define consistent margins
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Set default font
  pdf.setFont("helvetica", "normal");

  // ===== HEADER SECTION =====
  // Add logos
  const systemLogo = "/images/1.png";
  const schoolLogo = "/images/tup.jpg";

  // Add school logo (left aligned)
  pdf.addImage(schoolLogo, "PNG", margin, margin, 25, 25);

  // Add system name (center aligned)
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 51, 102); // Dark blue for heading
  const systemName = "IFIT-MOTION-DETECTION";
  const systemNameWidth =
    (pdf.getStringUnitWidth(systemName) * 20) / pdf.internal.scaleFactor;
  const systemNameX = (pageWidth - systemNameWidth) / 2;
  pdf.text(systemName, systemNameX, margin + 15);

  // Add system logo (right aligned)
  pdf.addImage(systemLogo, "PNG", pageWidth - margin - 25, margin, 25, 25);

  // Add horizontal line
  pdf.setDrawColor(0, 51, 102);
  pdf.setLineWidth(0.5);
  pdf.line(margin, margin + 32, pageWidth - margin, margin + 32);

  // ===== PREPARED BY SECTION =====
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Prepared by:", margin, margin + 45);

  // Contributors
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  const contributors = [
    "Avery Macasa",
    "Bryan James Batan",
    "Gelgin Delos Santos",
    "Tyron Justine Medina",
  ];

  contributors.forEach((name, index) => {
    pdf.text(name, margin + 5, margin + 52 + index * 6);
  });

  // Date prepared
  pdf.setFontSize(11);
  pdf.text(
    `Date Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - margin - 60,
    margin + 45
  );

  // ===== TITLE SECTION =====
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 51, 102);
  const title = "Overall Dashboard Report";
  const titleWidth =
    (pdf.getStringUnitWidth(title) * 18) / pdf.internal.scaleFactor;
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text(title, titleX, margin + 80);

  // ===== ANALYSIS SECTION =====
  // Section title
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Data Analysis & Insights", margin, margin + 90);

  // Underline section title
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.2);
  pdf.line(margin, margin + 92, margin + 70, margin + 92);

  // Generate intelligent analysis for each chart
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  let analysisY = margin + 100;

  // Analysis for Active vs Inactive Users
  const activeUsersCount = data.activeUsers.length;
  const inactiveUsersCount = data.inactiveUsers.length;
  const totalUsersCount = activeUsersCount + inactiveUsersCount;
  const activePercentage = (
    (activeUsersCount / totalUsersCount) *
    100
  ).toFixed(2);
  const inactivePercentage = (
    (inactiveUsersCount / totalUsersCount) *
    100
  ).toFixed(2);

  pdf.setFont("helvetica", "bold");
  pdf.text("Active vs Inactive Users Analysis:", margin, analysisY);
  pdf.setFont("helvetica", "normal");

  const activeAnalysis = [
    `• Active Users: ${activeUsersCount} (${activePercentage}%)`,
    `• Inactive Users: ${inactiveUsersCount} (${inactivePercentage}%)`,
    `• Recommendation: Focus on re-engaging inactive users through targeted campaigns.`,
  ];

  activeAnalysis.forEach((line, index) => {
    pdf.text(line, margin + 5, analysisY + 6 + index * 6);
  });

  analysisY += 25;

  // Analysis for Users by Gender
  const maleUsersCount = data.maleUsers.length;
  const femaleUsersCount = data.femaleUsers.length;
  const totalGenderUsers = maleUsersCount + femaleUsersCount;
  const malePercentage = ((maleUsersCount / totalGenderUsers) * 100).toFixed(2);
  const femalePercentage = (
    (femaleUsersCount / totalGenderUsers) *
    100
  ).toFixed(2);

  pdf.setFont("helvetica", "bold");
  pdf.text("Users by Gender Analysis:", margin, analysisY);
  pdf.setFont("helvetica", "normal");

  const genderAnalysis = [
    `• Male Users: ${maleUsersCount} (${malePercentage}%)`,
    `• Female Users: ${femaleUsersCount} (${femalePercentage}%)`,
    `• Recommendation: Ensure gender-balanced marketing strategies to engage all users.`,
  ];

  genderAnalysis.forEach((line, index) => {
    pdf.text(line, margin + 5, analysisY + 6 + index * 6);
  });

  analysisY += 25;

  // Analysis for Users by BMI Category
  const underweightCount = data.underweightUsers.length;
  const normalCount = data.normalUsers.length;
  const overweightCount = data.overweightUsers.length;
  const obeseCount = data.obeseUsers.length;
  const totalBMIUsers = underweightCount + normalCount + overweightCount + obeseCount;

  pdf.setFont("helvetica", "bold");
  pdf.text("Users by BMI Category Analysis:", margin, analysisY);
  pdf.setFont("helvetica", "normal");

  const bmiAnalysis = [
    `• Underweight Users: ${underweightCount} (${(
      (underweightCount / totalBMIUsers) *
      100
    ).toFixed(2)}%)`,
    `• Normal Users: ${normalCount} (${(
      (normalCount / totalBMIUsers) *
      100
    ).toFixed(2)}%)`,
    `• Overweight Users: ${overweightCount} (${(
      (overweightCount / totalBMIUsers) *
      100
    ).toFixed(2)}%)`,
    `• Obese Users: ${obeseCount} (${(
      (obeseCount / totalBMIUsers) *
      100
    ).toFixed(2)}%)`,
    `• Recommendation: Provide personalized health plans for overweight and obese users.`,
  ];

  bmiAnalysis.forEach((line, index) => {
    pdf.text(line, margin + 5, analysisY + 6 + index * 6);
  });

  analysisY += 35;

  // Analysis for BMI Distribution
  const averageBMI = (
    data.bmiData.reduce((sum, user) => sum + user.bmi, 0) / data.bmiData.length
  ).toFixed(2);
  const minBMI = Math.min(...data.bmiData.map((user) => user.bmi)).toFixed(2);
  const maxBMI = Math.max(...data.bmiData.map((user) => user.bmi)).toFixed(2);

  pdf.setFont("helvetica", "bold");
  pdf.text("BMI Distribution Analysis:", margin, analysisY);
  pdf.setFont("helvetica", "normal");

  const bmiDistributionAnalysis = [
    `• Average BMI: ${averageBMI}`,
    `• Minimum BMI: ${minBMI}`,
    `• Maximum BMI: ${maxBMI}`,
    `• Recommendation: Monitor users with extreme BMI values and provide tailored health advice.`,
  ];

  bmiDistributionAnalysis.forEach((line, index) => {
    pdf.text(line, margin + 5, analysisY + 6 + index * 6);
  });

  analysisY += 30;

  // Analysis for Leaderboard - Average Accuracy
  if (data.leaderboardData.length > 0) {
    const topUser = data.leaderboardData[0]; // Assuming data is sorted by average accuracy
    const averageAccuracy = (
      data.leaderboardData.reduce((sum, user) => sum + user.average_accuracy, 0) /
      data.leaderboardData.length
    ).toFixed(2);

    pdf.setFont("helvetica", "bold");
    pdf.text("Leaderboard - Average Accuracy Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");

    const leaderboardAnalysis = [
      `• Top User: ${topUser.name} with ${topUser.average_accuracy}% accuracy.`,
      `• Average Accuracy: ${averageAccuracy}%`,
      `• Recommendation: Recognize top performers and provide training for users with lower accuracy.`,
    ];

    leaderboardAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + index * 6);
    });

    analysisY += 25;
  }

  // Analysis for Total Dances
  if (data.leaderboardData.length > 0) {
    const totalDances = data.leaderboardData.reduce(
      (sum, user) => sum + user.total_dances,
      0
    );
    const averageDances = (totalDances / data.leaderboardData.length).toFixed(2);
    const maxDances = Math.max(...data.leaderboardData.map((user) => user.total_dances));
    const minDances = Math.min(...data.leaderboardData.map((user) => user.total_dances));

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Dances Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");

    const totalDancesAnalysis = [
      `• Total Dances: ${totalDances}`,
      `• Average Dances per User: ${averageDances}`,
      `• Maximum Dances: ${maxDances}`,
      `• Minimum Dances: ${minDances}`,
      `• Recommendation: Encourage users with lower dance counts to participate more frequently.`,
    ];

    totalDancesAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + index * 6);
    });

    analysisY += 25;
  }

  // Analysis for Calories Burned
  if (data.leaderboardData.length > 0) {
    const totalCalories = data.leaderboardData.reduce(
      (sum, user) => sum + (user.average_accuracy / 100) * (user.total_dances * 10),
      0
    );
    const averageCalories = (totalCalories / data.leaderboardData.length).toFixed(2);
    const maxCalories = Math.max(
      ...data.leaderboardData.map(
        (user) => (user.average_accuracy / 100) * (user.total_dances * 10)
      )
    );
    const minCalories = Math.min(
      ...data.leaderboardData.map(
        (user) => (user.average_accuracy / 100) * (user.total_dances * 10)
      )
    );

    pdf.setFont("helvetica", "bold");
    pdf.text("Calories Burned Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");

    const caloriesBurnedAnalysis = [
      `• Total Calories Burned: ${totalCalories.toFixed(2)}`,
      `• Average Calories Burned per User: ${averageCalories}`,
      `• Maximum Calories Burned: ${maxCalories.toFixed(2)}`,
      `• Minimum Calories Burned: ${minCalories.toFixed(2)}`,
      `• Recommendation: Encourage users to maintain consistent activity levels to burn more calories.`,
    ];

    caloriesBurnedAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + index * 6);
    });

    analysisY += 25;
  }

  // ===== CHARTS SECTION =====
  pdf.addPage();

  // Add Pie Chart - Active vs. Inactive Users
  if (data.pieChartRef.current) {
    const pieChartCanvas = await html2canvas(data.pieChartRef.current);
    const pieChartImgData = pieChartCanvas.toDataURL("image/png");
    const pieChartImgWidth = contentWidth;
    const pieChartImgHeight =
      (pieChartCanvas.height * pieChartImgWidth) / pieChartCanvas.width;

    pdf.addImage(
      pieChartImgData,
      "PNG",
      margin,
      margin + 25,
      pieChartImgWidth,
      pieChartImgHeight
    );
  } else {
    console.error("Pie Chart ref is not available.");
  }

  // Add Line Chart - Total Dances
  if (data.totalDancesChartRef.current) {
    const totalDancesCanvas = await html2canvas(data.totalDancesChartRef.current);
    const totalDancesImgData = totalDancesCanvas.toDataURL("image/png");
    const totalDancesImgWidth = contentWidth;
    const totalDancesImgHeight =
      (totalDancesCanvas.height * totalDancesImgWidth) / totalDancesCanvas.width;

    pdf.addImage(
      totalDancesImgData,
      "PNG",
      margin,
      margin + 25,
      totalDancesImgWidth,
      totalDancesImgHeight
    );
  } else {
    console.error("Total Dances Chart ref is not available.");
  }

  // Add Doughnut Chart - Calories Burned
  if (data.caloriesBurnedChartRef.current) {
    const caloriesBurnedCanvas = await html2canvas(data.caloriesBurnedChartRef.current);
    const caloriesBurnedImgData = caloriesBurnedCanvas.toDataURL("image/png");
    const caloriesBurnedImgWidth = contentWidth;
    const caloriesBurnedImgHeight =
      (caloriesBurnedCanvas.height * caloriesBurnedImgWidth) /
      caloriesBurnedCanvas.width;

    pdf.addImage(
      caloriesBurnedImgData,
      "PNG",
      margin,
      margin + 25,
      caloriesBurnedImgWidth,
      caloriesBurnedImgHeight
    );
  } else {
    console.error("Calories Burned Chart ref is not available.");
  }

  // Add footer and save PDF...
  pdf.save(`IFIT_Dashboard_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};
