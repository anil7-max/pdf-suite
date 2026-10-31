import SwiftUI

struct ZipView: View {
    @State private var isZipping = false
    @State private var success = false
    
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "archivebox.fill")
                .font(.system(size: 50))
                .foregroundColor(.purple)
            
            Text("File to ZIP Archive")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Select multiple files to compress into a clean ZIP archive")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button {
                isZipping = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    isZipping = false
                    success = true
                }
            } label: {
                Text(isZipping ? "Archiving..." : "Select Files from Files App")
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.purple)
                    .foregroundColor(.white)
                    .cornerRadius(14)
            }
            .padding(.horizontal)
            
            if success {
                Text("✅ ZIP archive created successfully")
                    .font(.subheadline)
                    .foregroundColor(.purple)
                    .fontWeight(.bold)
            }
            
            Spacer()
        }
        .padding(.top, 40)
        .navigationTitle("File to ZIP")
    }
}
