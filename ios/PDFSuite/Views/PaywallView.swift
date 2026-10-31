import SwiftUI

struct PaywallView: View {
    @Environment(\.dismiss) var dismiss
    @State private var tokensBalance: Int = 7
    @State private var dailyClaimed: Bool = false
    @State private var tipClaimed: Bool = false
    @State private var shareClaimed: Bool = false
    @State private var ratingClaimed: Bool = false
    @State private var showTipDetails: Bool = false
    @State private var successAlert: String? = nil
    
    var body: some View {
        ZStack {
            Color(red: 0.03, green: 0.04, blue: 0.08)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // Top Bar
                    HStack {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                                .foregroundColor(.green)
                            Text("100% FREE & OPEN-SOURCE")
                                .font(.caption2)
                                .fontWeight(.black)
                                .foregroundColor(.green)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.green.opacity(0.15))
                        .cornerRadius(20)
                        
                        Spacer()
                        
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title2)
                                .foregroundColor(.gray)
                        }
                    }
                    
                    // Header & Balance
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Earn Free Tokens")
                                .font(.system(size: 26, weight: .black))
                                .foregroundColor(.white)
                            Text("Complete quick tasks to convert unlimited files")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        Spacer()
                        
                        HStack(spacing: 4) {
                            Text("🪙")
                            Text("\(tokensBalance) Tokens")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.yellow)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.yellow.opacity(0.15))
                        .cornerRadius(12)
                    }
                    
                    Text("Complete simple tasks to earn conversion tokens. Zero payments required!")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    if let successAlert = successAlert {
                        HStack {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.green)
                            Text(successAlert)
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.green)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.green.opacity(0.15))
                        .cornerRadius(12)
                    }
                    
                    // Task 1: Daily Check-in (+3)
                    TaskRow(
                        icon: "sparkles",
                        iconColor: .orange,
                        title: "Daily Login Bonus",
                        badge: "+3 Tokens",
                        description: "Claim 3 free conversion tokens every 24 hours just by opening the app.",
                        isClaimed: dailyClaimed,
                        actionLabel: "Claim (+3)",
                        onAction: {
                            dailyClaimed = true
                            tokensBalance += 3
                            successAlert = "🎉 +3 Tokens claimed successfully!"
                        }
                    )
                    
                    // Task 2: 10-Second Tip (+5)
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            ZStack {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.blue.opacity(0.2))
                                    .frame(width: 40, height: 40)
                                Image(systemName: "lightbulb.fill")
                                    .foregroundColor(.blue)
                            }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text("Read Security & Pro Tip")
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                    Text("+5 Tokens")
                                        .font(.caption2)
                                        .fontWeight(.black)
                                        .foregroundColor(.blue)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.blue.opacity(0.2))
                                        .cornerRadius(6)
                                }
                                Text("Read a 10-second document tip and instantly earn 5 tokens.")
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                            }
                            
                            Spacer()
                            
                            Button {
                                withAnimation {
                                    showTipDetails.toggle()
                                }
                                if !tipClaimed {
                                    tipClaimed = true
                                    tokensBalance += 5
                                    successAlert = "🎉 +5 Tokens added successfully!"
                                }
                            } label: {
                                Text(tipClaimed ? "Read ✓" : "Read Tip (+5)")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(tipClaimed ? Color.green : Color.blue)
                                    .cornerRadius(10)
                            }
                        }
                        
                        if showTipDetails {
                            Text("💡 Pro Tip: When uploading PDFs to official job or university portals, choosing Compress PDF (Balanced Mode) preserves crisp text clarity while cutting file size by up to 80%!")
                                .font(.caption2)
                                .foregroundColor(.blue.opacity(0.9))
                                .padding(10)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.blue.opacity(0.12))
                                .cornerRadius(10)
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.04))
                    .cornerRadius(16)
                    
                    // Task 3: Share App (+10)
                    TaskRow(
                        icon: "square.and.arrow.up.fill",
                        iconColor: .green,
                        title: "Share with Friends",
                        badge: "+10 Tokens",
                        description: "Share PDF Suite with colleagues or WhatsApp groups to earn 10 tokens.",
                        isClaimed: shareClaimed,
                        actionLabel: "Share Link (+10)",
                        onAction: {
                            shareClaimed = true
                            tokensBalance += 10
                            successAlert = "🎉 +10 Tokens added successfully!"
                        }
                    )
                    
                    // Task 4: Feedback (+5)
                    TaskRow(
                        icon: "star.fill",
                        iconColor: .purple,
                        title: "Rating & Feedback",
                        badge: "+5 Tokens",
                        description: "Leave a 5-star rating to support open-source development.",
                        isClaimed: ratingClaimed,
                        actionLabel: "Submit (+5)",
                        onAction: {
                            ratingClaimed = true
                            tokensBalance += 5
                            successAlert = "🎉 Thank You! +5 Tokens added!"
                        }
                    )
                    
                    Spacer(minLength: 20)
                    
                    Button {
                        dismiss()
                    } label: {
                        HStack {
                            Text("Continue Converting (\(tokensBalance) Tokens Available)")
                            Image(systemName: "arrow.right")
                        }
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.white)
                        .cornerRadius(14)
                    }
                }
                .padding(20)
            }
        }
    }
}

struct TaskRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let badge: String
    let description: String
    let isClaimed: Bool
    let actionLabel: String
    let onAction: () -> Void
    
    var body: some View {
        HStack {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(iconColor.opacity(0.2))
                    .frame(width: 40, height: 40)
                Image(systemName: icon)
                    .foregroundColor(iconColor)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text(badge)
                        .font(.caption2)
                        .fontWeight(.black)
                        .foregroundColor(iconColor)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(iconColor.opacity(0.2))
                        .cornerRadius(6)
                }
                Text(description)
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            Button {
                if !isClaimed {
                    onAction()
                }
            } label: {
                Text(isClaimed ? "Claimed ✓" : actionLabel)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(isClaimed ? Color.green : iconColor)
                    .cornerRadius(10)
            }
            .disabled(isClaimed)
        }
        .padding()
        .background(Color.white.opacity(0.04))
        .cornerRadius(16)
    }
}
