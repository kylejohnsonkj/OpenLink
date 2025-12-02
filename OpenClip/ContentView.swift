//
//  ContentView.swift
//  OpenClip
//
//  Created by Kyle Johnson on 9/13/24.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        ScrollView {
            HeaderView()
            HowToListView()
        }
        .background(
            LinearGradient(gradient: Gradient(colors: [
                .background,
                .background,
                .tableViewBackground,
                .tableViewBackground
            ]), startPoint: .top, endPoint: .bottom)
        )
    }
}

struct HeaderView: View {
    var body: some View {
        HStack(spacing: 0) {
            Image("AppIcon-Rounded")
                .resizable()
                .frame(width: 96, height: 96)
                .padding(.trailing)
            
            VStack(alignment: .leading) {
                Text("OpenClip")
                    .font(.title)
                    .bold()
                Text("A Safari extension that lets you watch shared videos in your browser")
                    .font(.footnote)
                    .bold()
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}

struct HowToListView: View {
    @ScaledMetric var buttonInset = 35
    @ScaledMetric var maxVideoWidth = 550 // for iPad
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("How to enable")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .padding(.top)
            
            ListEntry(
                Text("Open a shared TikTok video"),
                image: "1.circle"
            )
            .padding(.top, 12)
            .padding(.bottom, 8)
            
            ListButton(
                text: "Try it now!",
                image: "music.note",
                link: "https://www.tiktok.com/t/ZP8eVDC8c/"
            )
            .tint(.pink)
            .padding(.leading, buttonInset)
            
            ListEntry(
                tapInstructionsText, // Tap the icon...
                image: "2.circle"
            )
            .padding(.vertical, 12)
            
            ListEntry(
                Text("Enable the OpenClip extension"),
                image: "3.circle"
            )
            .padding(.bottom, 12)
            
            ListEntry(
                Text("Tap OpenClip and select \"Always Allow\""),
                image: "4.circle"
            )
            
            Group {
                VideoExplainerSwiftUIView()
                    .aspectRatio(1, contentMode: .fit)
                    .frame(maxWidth: maxVideoWidth)
                    .shadow(radius: 3)
                    .padding(.vertical)
                    .padding(.horizontal, 2)
            }
            .frame(maxWidth: .infinity)
            
            ListEntry(
                Text("Videos still not playing?"),
                image: "questionmark.circle"
            )
            .padding(.bottom, 8)
            
            ListButton(
                text: "Verify setup",
                image: "gear"
            )
            .tint(.buttonGray)
            .padding(.leading, buttonInset)
            .padding(.bottom)
            
            Text("TikTok® is a registered trademark of ByteDance Ltd. OpenClip is not affiliated with or endorsed by TikTok or ByteDance Ltd. All videos are provided by [tiktok.com](https://www.tiktok.com).")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
        }
        .padding(.horizontal)
        .background(.tableViewBackground)
    }
    
    var tapInstructionsText: Text {
        if UIDevice.current.userInterfaceIdiom == .phone {
            if #available(iOS 18, *) {
                Text("Tap the \(Image("symbol")) icon on the left of the search bar")
            } else {
                Text("Tap the \(Image(systemName: "textformat.size")) icon on the left of the search bar")
            }
        } else {
            Text("Tap the \(Image(systemName: "puzzlepiece.extension")) icon on the right of the search bar")
        }
    }
    
    struct ListEntry: View {
        let text: Text
        let image: String
        
        init(_ text: Text, image: String) {
            self.text = text
            self.image = image
        }
        
        var body: some View {
            Label {
                text
                    .font(.headline)
                    .imageScale(.large)
            } icon: {
                Image(systemName: image)
                    .imageScale(.large)
            }
        }
    }
}

#Preview {
    ContentView()
}
