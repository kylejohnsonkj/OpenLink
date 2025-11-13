//
//  OpenClipApp.swift
//  OpenClip
//
//  Created by Kyle Johnson on 9/13/24.
//

import StoreKit
import SwiftUI

@main
struct OpenClipApp: App {
    var body: some Scene {
        WindowGroup {
            ContentScene()
        }
    }
}

struct ContentScene: View {
    @Environment(\.requestReview) private var requestReview
    @State var isReviewSheetPresented = false
    
    var body: some View {
        ContentView()
            .onOpenURL { url in
                switch url.host {
                case "review":
                    Task { @MainActor in
                        try await Task.sleep(for: .seconds(0.25))
                        requestReview()
                        try await Task.sleep(for: .seconds(0.75))
                        isReviewSheetPresented = true
                    }
                default:
                    break
                }
            }
            .sheet(isPresented: $isReviewSheetPresented) {
                ReviewSheetView()
            }
    }
}

struct ReviewSheetView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
                Text("OpenClip v\(appVersion)")
                    .font(.headline)
                Spacer()
                Button(action: {
                    dismiss()
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(Color(UIColor.lightGray))
                        .imageScale(.large)
                }
            }
            .padding(.vertical)
            .padding(.horizontal, 20)
            
            Text("Leaving a rating or [review](https://itunes.apple.com/app/id6708240044?action=write-review) helps support development and makes it easier for others to discover OpenClip on the App Store. 🙂")
                .font(.callout)
                .padding(.horizontal, 20)
        }
        .presentationDetents([.height(151)])
    }
}

#Preview {
    ContentScene(isReviewSheetPresented: true)
}
