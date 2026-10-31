import SwiftUI

struct HomeView: View {
    @ObservedObject var api = APIService.shared
    @State private var showingAuth = false
    @State private var showingPaywall = false
    @State private var selectedTool: String? = nil
    
    var isPremium: Bool {
        api.currentUser?.isPremium ?? false
    }
    
    var remainingQuota: Int {
        api.currentUser?.quota?.remainingToday ?? 3
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Quota / Pro Banner
                    if isPremium {
                        HStack {
                            Image(systemName: "crown.fill")
                                .foregroundColor(.yellow)
                            Text("PRO Member - Unlimited Conversions")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.green)
                            Spacer()
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(16)
                    } else {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("🪙 Available Balance: \(remainingQuota) Tokens")
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                    .foregroundColor(.yellow)
                                Text("100% Free & Open-Source • 1 Token = 1 Conversion")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Button("Earn ⚡") {
                                showingPaywall = true
                            }
                            .font(.caption)
                            .fontWeight(.bold)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(Color.yellow.opacity(0.2))
                            .foregroundColor(.yellow)
                            .cornerRadius(10)
                        }
                        .padding()
                        .background(Color.yellow.opacity(0.08))
                        .cornerRadius(16)
                    }
                    
                    // Tools Grid
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        NavigationLink(destination: ImageToPdfView()) {
                            ToolCard(
                                title: "Image to PDF",
                                subtitle: "Photos to PDF",
                                systemImage: "photo.stack.fill",
                                color: .pink
                            )
                        }
                        
                        NavigationLink(destination: CompressPdfView()) {
                            ToolCard(
                                title: "Compress PDF",
                                subtitle: "Shrink file size",
                                systemImage: "arrow.down.right.and.arrow.up.left",
                                color: .green
                            )
                        }
                        
                        NavigationLink(destination: ZipView()) {
                            ToolCard(
                                title: "File to ZIP",
                                subtitle: "Bundle files into ZIP",
                                systemImage: "archivebox.fill",
                                color: .purple
                            )
                        }
                        
                        Button {
                            // Scanner
                            selectedTool = "scanner"
                        } label: {
                            ToolCard(
                                title: "Vision Scanner",
                                subtitle: "Scan physical docs",
                                systemImage: "doc.viewfinder.fill",
                                color: .blue
                            )
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("PDF Suite")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAuth = true
                    } label: {
                        Image(systemName: "person.circle")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAuth) {
                AuthView()
            }
            .sheet(isPresented: $showingPaywall) {
                PaywallView()
            }
        }
    }
}

struct ToolCard: View {
    let title: String
    let subtitle: String
    let systemImage: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: systemImage)
                .font(.title2)
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(color)
                .cornerRadius(12)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity, minHeight: 140, alignment: .topLeading)
        .background(Color(.systemBackground))
        .cornerRadius(18)
        .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 3)
    }
}
