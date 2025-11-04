//
//  ListButton.swift
//  OpenLink
//
//  Created by Kyle Johnson on 9/21/24.
//

import SwiftUI

struct ListButton: View {
    let text: String
    let image: String
    let link: String?
    
    init(text: String, image: String, link: String? = nil) {
        self.text = text
        self.image = image
        self.link = link
    }
    
    @State var isSheetPresented = false
    
    var buttonLabel: some View {
        HStack {
            Image(systemName: image)
                .imageScale(.large)
            Text(text)
        }
    }
    
    var body: some View {
        Group {
            if let link {
                Link(destination: URL(string: link)!) {
                    buttonLabel
                }
            } else {
                Button {
                    isSheetPresented = true
                } label: {
                    buttonLabel
                }
                .sheet(isPresented: $isSheetPresented) {
                    VerifySetupListView()
                }
            }
        }
        .buttonStyle(.borderedProminent)
    }
}

#Preview {
    ContentView()
}
