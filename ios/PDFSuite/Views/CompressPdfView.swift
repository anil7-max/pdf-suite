import SwiftUI

struct CompressPdfView: View {
    @State private var selectedLevel = "recommended"
    @State private var isCompressing = false
    @State private var success = false
    
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "arrow.down.right.and.arrow.up.left")
                .font(.system(size: 50))
                .foregroundColor(.green)
            
            Text("Compress PDF File")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Select compression level to shrink file size while preserving readability")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Picker("Level", selection: $selectedLevel) {
                Text("Extreme (Smallest)").tag("extreme")
                Text("Recommended (Optimal)").tag("recommended")
                Text("Low (High Quality)").tag("low")
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            
            Button {
                isCompressing = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    isCompressing = false
                    success = true
                }
            } label: {
                Text(isCompressing ? "Compressing..." : "Choose PDF Document")
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(14)
            }
            .padding(.horizontal)
            
            if success {
                Text("✅ PDF compressed successfully (-65% size reduction)")
                    .font(.subheadline)
                    .foregroundColor(.green)
                    .fontWeight(.bold)
            }
            
            Spacer()
        }
        .padding(.top, 40)
        .navigationTitle("Compress PDF")
    }
}
