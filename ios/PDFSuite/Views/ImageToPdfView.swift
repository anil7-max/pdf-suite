import SwiftUI
import PhotosUI

struct ImageToPdfView: View {
    @State private var selectedItems: [PhotosPickerItem] = []
    @State private var selectedImagesData: [Data] = []
    @State private var isConverting = false
    @State private var convertedUrl: String? = nil
    @State private var errorMessage: String? = nil
    
    var body: some View {
        VStack {
            if selectedImagesData.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "photo.badge.plus")
                        .font(.system(size: 60))
                        .foregroundColor(.pink)
                    
                    Text("Select Photos to Convert")
                        .font(.title3)
                        .fontWeight(.bold)
                    
                    Text("Choose JPG, PNG, or HEIC pictures from your photo library")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    PhotosPicker(
                        selection: $selectedItems,
                        matching: .images,
                        photoLibrary: .shared()
                    ) {
                        Text("Select from Photos")
                            .fontWeight(.bold)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.pink)
                            .foregroundColor(.white)
                            .cornerRadius(14)
                    }
                    .padding(.horizontal, 32)
                    .onChange(of: selectedItems) { newItems in
                        Task {
                            selectedImagesData.removeAll()
                            for item in newItems {
                                if let data = try? await item.loadTransferable(type: Data.self) {
                                    selectedImagesData.append(data)
                                }
                            }
                        }
                    }
                }
                .padding()
            } else {
                ScrollView {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ForEach(0..<selectedImagesData.count, id: \.self) { index in
                            if let uiImage = UIImage(data: selectedImagesData[index]) {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: 100, height: 100)
                                    .clipped()
                                    .cornerRadius(10)
                            }
                        }
                    }
                    .padding()
                }
                
                Button {
                    Task {
                        isConverting = true
                        do {
                            let res = try await APIService.shared.convertImagesToPdf(imagesData: selectedImagesData)
                            convertedUrl = res.downloadUrl
                        } catch {
                            errorMessage = error.localizedDescription
                        }
                        isConverting = false
                    }
                } label: {
                    Text(isConverting ? "Converting..." : "Generate PDF Document")
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.pink)
                        .foregroundColor(.white)
                        .cornerRadius(14)
                }
                .disabled(isConverting)
                .padding()
            }
        }
        .navigationTitle("Image to PDF")
    }
}
