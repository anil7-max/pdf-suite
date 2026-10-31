import SwiftUI

struct AuthView: View {
    @Environment(\.dismiss) var dismiss
    @State private var email = "user@pdfsuite.com"
    @State private var password = "User@123"
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "envelope.badge.shield.half.filled")
                    .font(.system(size: 50))
                    .foregroundColor(.pink)
                    .padding(.top, 20)
                
                Text("Email ID & Password")
                    .font(.title2)
                    .fontWeight(.black)
                
                Text("Sign in or enter a new email to automatically register your account")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                if let err = errorMessage {
                    Text(err)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(12)
                        .padding(.horizontal)
                }
                
                TextField("Email Address", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding(.horizontal)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)
                
                Button {
                    Task {
                        isLoading = true
                        errorMessage = nil
                        do {
                            _ = try await APIService.shared.emailLogin(email: email, password: password)
                            dismiss()
                        } catch {
                            errorMessage = error.localizedDescription
                        }
                        isLoading = false
                    }
                } label: {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .tint(.white)
                        }
                        Text(isLoading ? "Authenticating..." : "Sign In / Auto-Register")
                            .fontWeight(.bold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.pink)
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .disabled(isLoading)
                .padding(.horizontal)
                
                // Quick test accounts
                VStack(alignment: .leading, spacing: 8) {
                    Text("Quick Test Profiles:")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 8) {
                        Button {
                            email = "user@pdfsuite.com"
                            password = "User@123"
                            errorMessage = nil
                        } label: {
                            VStack(alignment: .leading) {
                                Text("Client User").fontWeight(.bold)
                                Text("user@pdfsuite.com").font(.caption2).foregroundColor(.secondary)
                            }
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(.secondarySystemBackground))
                            .cornerRadius(10)
                        }
                        
                        Button {
                            email = "admin@pdfsuite.com"
                            password = "Admin@123456"
                            errorMessage = nil
                        } label: {
                            VStack(alignment: .leading) {
                                Text("Super Admin").fontWeight(.bold).foregroundColor(.indigo)
                                Text("admin@pdfsuite.com").font(.caption2).foregroundColor(.secondary)
                            }
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.indigo.opacity(0.1))
                            .cornerRadius(10)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, 10)
                
                Spacer()
            }
            .navigationTitle("Sign In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}
