// content.js
async function enhancePropertyListing() {
  if (!window.location.pathname.includes("/property-profile/")) {
    const propertyAddress = window.location.pathname
      .split("/")[1]
      .split("-")
      .slice(0, -1)
      .join("-");

    const profileUrl = `https://www.domain.com.au/property-profile/${propertyAddress}`;

    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.src = profileUrl;
      });

      async function loadAllHistory() {
        return new Promise((resolve) => {
          const checkAndClick = async () => {
            const viewMoreButton =
              iframe.contentDocument.querySelector("button");

            if (viewMoreButton?.textContent.includes("View more results")) {
              viewMoreButton.click();

              await new Promise((resolve) => setTimeout(resolve, 1000));
              checkAndClick();
            } else {
              resolve();
            }
          };

          checkAndClick();
        });
      }

      await loadAllHistory();

      const doc = iframe.contentDocument;

      // Extract all stylesheet links and add them to current page
      const styleSheets = Array.from(
        doc.querySelectorAll('link[rel="stylesheet"]')
      );
      styleSheets.forEach((stylesheet) => {
        if (!document.querySelector(`link[href="${stylesheet.href}"]`)) {
          const newStylesheet = document.createElement("link");
          newStylesheet.rel = "stylesheet";
          newStylesheet.href = stylesheet.href;
          document.head.appendChild(newStylesheet);
        }
      });

      function findSectionByHeadingText(doc, headingText) {
        const sections = doc.getElementsByTagName("section");
        for (const section of sections) {
          const h2 = section.querySelector("h2");

          if (h2?.textContent.includes(headingText)) {
            h2.className = "property-heading";
            return h2.parentNode.parentNode;
          }
        }
        return null;
      }

      const estimateCard = doc.querySelector('[data-testid="estimate-card"]');

      const propertyHistorySection = findSectionByHeadingText(
        doc,
        "Property history"
      );

      propertyHistorySection.querySelector('[data-testid="tab-Sold"]').click();

      propertyHistorySection
        .querySelector('[role="tablist"]')
        .parentNode.parentNode.remove();

      propertyHistorySection.lastChild.remove();

      const container = document.createElement("div");

      const containerStyles = document.createElement("style");
      containerStyles.textContent = `
    .property-history-container {
		max-width: 500px;
		background-color: #ffffff;
	}
	@media (min-width: 624px) {
		.property-heading {
			font-size: 25px;
		}
	}
	.property-heading {
		font-size: 23px;
		font-weight: bold;
		text-align: left;
	}

	.estimate-container {
		margin-top: 1rem;
		max-width: 300px;
		opacity: 0.5;
	}
	.hidden {
		display: none;
	}
        `;
      document.head.appendChild(containerStyles);
      container.className = "property-history-container";

      if (estimateCard) {
        const estimateClone = estimateCard.cloneNode(true);

        estimateClone.setAttribute("class", estimateCard.getAttribute("class"));

        estimateClone
          .querySelector('[data-testid="info-text"]')
          .parentNode.remove();
        const pTags = estimateClone.querySelectorAll("p");
        pTags.forEach((ele) => {
          if (ele.textContent.includes("Source: ")) {
            ele.className = "hidden";
          }
        });

        const estimateContainer = document.createElement("div");
        estimateContainer.className = "estimate-container";
        estimateContainer.appendChild(estimateClone);

        const addressContainer = document.querySelector(
          '[data-testid="listing-details__button-copy-wrapper"]'
        );
        if (addressContainer) {
          addressContainer.parentNode.insertBefore(
            estimateContainer,
            addressContainer
          );
        }
      }

      if (propertyHistorySection) {
        const historyClone = propertyHistorySection.cloneNode(true);

        historyClone.setAttribute(
          "class",
          propertyHistorySection.getAttribute("class")
        );

        container.appendChild(historyClone);
      }

      const propertyDetails = document.querySelector(
        '[data-testid="listing-details__summary"]'
      );

      if (propertyDetails) {
        propertyDetails.parentNode.insertBefore(
          container,
          propertyDetails.nextSibling
        );
      }

      // Add any inline styles from the original page
      const originalStyles = doc.getElementsByTagName("style");
      Array.from(originalStyles).forEach((style) => {
        const newStyle = document.createElement("style");
        newStyle.textContent = style.textContent;
        document.head.appendChild(newStyle);
      });

      iframe.remove();
    } catch (error) {
      console.error("Error in enhancePropertyListing:", error);
      console.error("Error stack:", error.stack);
    }
  } else {
    console.log("Not a property listing page, skipping...");
  }
}

// Run on page load and dynamic updates
console.log("Setting up extension...");
window.onload = () => {
  console.log("Window loaded, running enhancement...");
  enhancePropertyListing();
};
