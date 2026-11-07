Feature: The WHO SMART IG theme is re-derived from the vendored who.css
  Every value of the who-smart-ig theme is re-read from the vendored upstream
  stylesheet, the values deliberately not taken stay not taken, and the
  platform can find the theme through the instance's declaration.

  @test:smart-base/themes/themes.test.ts::whoCssIsWholeFile
  Scenario: `who.css` is present and is the whole file, not a fragment
    Given the vendored who.css
    Then it has more than 700 lines

  @test:smart-base/themes/themes.test.ts::pinnedShasAreFullCommitIds
  Scenario: the pinned shas are full 40-character commit ids
    Then the upstream ig, template and base shas are each 40 hex characters

  @test:smart-base/themes/themes.test.ts::licencePermitsVendoring
  Scenario: the licence recorded is the one that permits vendoring
    Then the upstream template's licence is "CC0-1.0"

  @test:smart-base/themes/themes.test.ts::themeResolves
  Scenario: the theme resolves at all
    Then the theme looked up by id "who-smart-ig" has id "who-smart-ig"

  @test:smart-base/themes/themes.test.ts::accentIsNavbarBgColor
  Scenario: `accent` is `--navbar-bg-color`
    Then the palette's accent is who.css's --navbar-bg-color

  @test:smart-base/themes/themes.test.ts::surfaceIsBodyBackground
  Scenario: `surface` is what `body`'s background resolves to
    Then who.css sets body's background-color to var(--toc-box-bg-color)
    And the palette's surface is who.css's --toc-box-bg-color

  @test:smart-base/themes/themes.test.ts::inkIsContainerColour
  Scenario: `ink` is `.container`'s colour, which OVERRIDES the base's #333333
    Then who.css declares a hex colour on .container
    And the palette's ink is that colour in six-digit form

  @test:smart-base/themes/themes.test.ts::hash333OnlyDropdownText
  Scenario: `#333` is still only dropdown-link text, so it is still not `ink`
    Then at least one rule in who.css sets color #333
    And every such rule's selector is a dropdown-menu selector

  @test:smart-base/themes/themes.test.ts::tocBoxBorderNotEdge
  Scenario: `--toc-box-border` is still declared, and is still not `edge`
    Then who.css declares --toc-box-border
    And no theme's edge is that value

  @test:smart-base/themes/themes.test.ts::topNavbarNotReproduced
  Scenario: the top navbar is declared upstream and deliberately not reproduced
    Then who.css has .navbar rules
    And no theme's palette or layouts mention a navbar

  @test:smart-base/themes/themes.test.ts::laptopTakesDeclaredMaxWidth
  Scenario: `laptop` takes the one max-width the stylesheet declares
    Then who.css's min-width 2200px media query caps max-width at "1980px"
    And the laptop layout's minWidth is "1980px"

  @test:smart-base/themes/themes.test.ts::mobileAndCardTakeFluidWidth
  Scenario: `mobile` and `card` take the declared fluid width, not a guessed one
    Then who.css gives .container width 100%
    And the mobile and card layouts' minWidth are "100%"

  @test:smart-base/themes/themes.test.ts::paddingIsContainerValue
  Scenario: padding is the one value the container declares
    Then who.css gives .container padding "0 20px"
    And the laptop, mobile and card layouts' padding is "20px"

  @test:smart-base/themes/themes.test.ts::fontScaleIsOneEverywhere
  Scenario: `fontScale` is 1 everywhere because no per-breakpoint scale is declared
    Then who.css has no media query setting body's font-size
    And the laptop, mobile and card layouts' fontScale is 1

  @test:smart-base/themes/themes.test.ts::instanceThemesResolvesByName
  Scenario: `instanceThemes` resolves it through the declaration, by name
    When the platform's instanceThemes is asked for the theme instance from the checkout root
    Then it resolves ok
    And its themes include "who-smart-ig"

  @test:smart-base/themes/themes.test.ts::isInstancesOneWebpageTheme
  Scenario: it is the instance's ONE webpage theme, so the generator has no choice to make
    When the platform's instanceWebpageThemes is read from the checkout root
    Then the theme instance's webpage themes are exactly "who-smart-ig"
