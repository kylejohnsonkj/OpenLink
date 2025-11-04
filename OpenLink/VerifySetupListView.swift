//
//  VerifySetupListView.swift
//  OpenLink
//
//  Created by Kyle Johnson on 9/21/24.
//

import SwiftUI

struct VerifySetupListView: View {
    var body: some View {
        List {
            Section {
                ListEntry(
                    Text("Open the **Settings** app"),
                    image: "gear",
                    color: .gray
                )
                if #available(iOS 18, *) {
                    ListEntry(
                        Text("Select **Apps**"),
                        image: "square.grid.3x3",
                        color: .purple
                    )
                }
                ListEntry(
                    Text("Select **Safari**"),
                    image: "safari",
                    color: .blue
                )
                ListEntry(
                    Text("Select **Extensions**"),
                    image: "puzzlepiece.extension",
                    color: .teal
                )
                ListEntry(
                    Text("Select **OpenLink**"),
                    image: "bolt.horizontal",
                    color: .pink
                )
                ListEntry(
                    Text("Turn **Allow Extension** On"),
                    image: "switch.2",
                    color: .green
                )
                ListEntry(
                    Text("Set **tiktok.com** to Allow"),
                    image: "checkmark.circle",
                    color: .orange
                )
                ListEntry(
                    Text("Set **Other Websites** to Ask"),
                    image: "checkmark.circle",
                    color: .orange
                )
            } header: {
                Text("\nVerify setup")
            } footer: {
                Text("If issues persist, reach out for support at [kylejohnsonapps.com/contact](https://kylejohnsonapps.com/contact)")
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }
    
    struct ListEntry: View {
        let text: Text
        let image: String
        let color: Color
        
        init(_ text: Text, image: String, color: Color) {
            self.text = text
            self.image = image
            self.color = color
        }
        
        var body: some View {
            Label {
                text
            } icon: {
                Image(systemName: image)
                    .foregroundStyle(color)
            }
        }
    }
}

#Preview {
    VerifySetupListView()
}
